# Scraping

**Author**: `Michael Schmidmaier`

OpenEU uses multiple scraper scripts to scrape publicly available information.
Most of the scraped information is about past and upcoming meetings and events, but there is also other data, such as legislative files. All scraper scripts are in the `app/data_sources/scrapers` directory. More information on the individual data sources can be found in the [data sources documentation](sources).

## 📦 Technologies

- 🕷️ [**Scrapy**](https://scrapy.org/): Python-based web scraping framework for extracting structured data from websites
  - used for server rendered pages and static content like RSS feeds
- 🥣 [**BeautifulSoup**](https://www.crummy.com/software/BeautifulSoup/): Python library for parsing HTML and XML documents
  - used for parsing HTML content and extracting data
- 🧪 [**Playwright**](https://playwright.dev/): Automated browser testing tool that enables headless web scraping of dynamic content
  - used for scraping dynamic content that requires JavaScript execution
- 🤖 [**Crawl4AI**](https://docs.crawl4ai.com/): Open-Source LLM-Friendly Web Crawler & Scraper with built-in anti-bot-protection measures
  - used for scraping websites with more advanced anti-bot measures
  - supports both static and dynamic content
  - offers many built-in features, but may be overkill for simpler scraping tasks

## 🟦 ScraperBase class ([file](https://github.com/jst-seminar-rostlab-tum/openeu-backend/blob/main/app/data_sources/scraper_base.py))

The `ScraperBase` is an abstract base class that provides common functionality for all scrapers in the system. It handles data extraction, storage, embedding, and error handling in a consistent way.

### Key Features

- **Retry Mechanism**: Automatically retries failed scraping attempts
- **Logging**: Unified logging for starting, retrying, stopping and errors
- **Error Handling**: Comprehensive error handling with notifications
- **Data Storage**: Built-in methods for storing scraped data in Supabase
- **Topic Extraction**: Automatic topic assignment for scraped meetings
- **Embedding Generation**: Creates embeddings for semantic search

### Main Components

- **ScraperResult**: Data class for encapsulating the results of a scraping operation
- **Store Methods**: `store_entry` and `store_entry_returning_id` for database operations
- **Embedding**: `embedd_entries` method to generate vector embeddings for scraped content
- **Error Notification**: Alerts developers on scraper errors using email

### Configuration Options

- `table_name`: The database table where scraped data will be stored
- `max_retries`: Maximum number of retry attempts for failed scraping
- `retry_delay`: Delay between retry attempts in seconds
- `stop_event`: Event for graceful termination of scraping processes which scrapers should regularly check to stop gracefully on request ([more details below](#graceful-stopping-stop_event))

### Usage

Scraper implementations should inherit from `ScraperBase` and at least implement the `__init__` and `scrape_once` methods:

```python
class CustomScraper(ScraperBase):
    # here you can pass additional needed properties like start and end date
    def __init__(self, stop_event: multiprocessing.synchronize.Event, start_date: date, end_date: date):
        super().__init__(table_name=XYZ_TABLE_NAME, stop_event=stop_event)
        self.start_date = start_date
        self.end_date = end_date
        self.entries: list[XYZ_ENTRY] = []

    def scrape_once(self, last_entry, **args) -> ScraperResult:
        # Implementation of specific scraping logic
        # Example with pseudo-code:

        # scraped_entries = self.scrape_data()
        # filtered_entries = self.remove_duplicates(scraped_entries)

        # count = 0
        # for entry in filtered_entries.values():
        #     try:
        #         self.store_entry(entry.model_dump(), embedd_entries=True)
        #         self.entries.append(entry)
        #         count += 1
        #     except Exception as e:
        #         error = f"Error storing entry {entry.title}: {e}"
        #         self.logger.error(f"Error inserting meeting {entry.title}: {e}")
        #         continue

        return ScraperResult(success=True, lines_added=count, error=error, last_entry=last_entry)

    # Additional methods for scraping, filtering, and processing entries can be implemented here
    # ...
```

### Graceful stopping (`stop_event`)

The scheduler starts scrapers in separate threads or processes. In case of threads, it is impossible to just kill thread in a safe way without leaking resources. To support graceful termination of scraping processes, for example on a scheduler timeout, there is the `stop_event`. All scrapers should regularly check the `stop_event` provided by the scheduler. This allows long-running scraper tasks to stop cleanly when requested, without losing data, leaving operations incomplete, or leaking resources.

#### Example implementation

```python
if self.stop_event.is_set():
    browser.close()
    return ScraperResult(
        success=False,
        error=Exception("Scrape stopped by external stop event"),
        last_entry=self.last_entry,
    )
```

## 🚫 Handling Duplicates

To avoid duplicate entries in the database, scrapers should implement a mechanism to check for existing entries before storing new ones.

If possible, this can be done by facilitating the upsert functionality of `store_entry` in case the scraped information contains a unique identifier that can be used for upserting.

#### Example: upserting using a custom unique identifier (here: `url`)

```python
self.store_entry(meeting.model_dump(), on_conflict="url", embedd_entries=False)
```

If there is no unique identifier, scrapers should implement a custom logic to filter out duplicates before storing entries. This can be done by comparing the title, date, and other relevant fields of the scraped entries against existing entries in the database.

#### fuzzy matching example from [`spanish_commission_scraper.py`](https://github.com/jst-seminar-rostlab-tum/openeu-backend/blob/2ff575bcc7866f62d1f1215e4fa568490943fe3f/app/data_sources/scrapers/spanish_commission_scraper.py#L194C5-L212C25)

```python
result = supabase.table("spanish_commission_meetings").select("id, title").eq("date", entry.date).execute()
existing_entries = result.data or []

for existing in existing_entries:
    existing_title = existing["title"]
    if fuzz.token_sort_ratio(existing_title, entry.title) > 90:
        self.logger.info(f"Duplicate found: {entry.title} matches {existing_title}")
        return True # duplicate
return False # not a duplicate
```

## 🌐 Languages

As OpenEU's platform language is English, sometimes scraped data has to be translated from other languages before it can be stored. This can be done using the Translator class from `app/data_sources/translator/translator.py`.

#### Translation Example

```python
from app.data_sources.translator.translator import Translator

translator = Translator()

try:
    translated_text = translator.translate("Voici un exemple de texte en français")
    print(translated_text)  # "Here is an example of text in French"
except Exception as e:
    logger.warning(f"Translation failed: {e}")
```

## ⏰ Scheduling Scrapers

Scrapers are usually scheduled to run at specific intervals. The jobs are defined in `app/core/jobs.py`. More information on how the scheduler works can be found in the [scheduler documentation](scheduling_jobs).

#### Example of a scheduled scraper job:

```python
def scrape_ec_res_inno_meetings(stop_event: multiprocessing.synchronize.Event):
    today = datetime.now().date()
    end_date = today + timedelta(days=365)
    scraper = EcResInnoMeetingsScraper(start_date=today, end_date=end_date, stop_event=stop_event)
    return scraper.scrape()

# register the job to run daily at 03:30
scheduler.register(
    "scrape_ec_res_inno_meetings",
    scrape_ec_res_inno_meetings,
    schedule.every().day.at("03:30"),
    run_in_process=True, # Crawl4AI scrapers need to run in a separate process, threads do not work
)
```
