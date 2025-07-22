
# Sources

**Author**: `Julius Kleinle`


OpenEU harvests structured information from a curated set of institutional websites, official APIs and social feeds across the EU and its member states. This document is the front-door catalogue: for every origin we scrape you’ll find what it is, why we need it, and the key technical details that let the scraper run.  

[**Fig Jam Overview**](https://www.figma.com/board/aiuBPTYWxoqA0ZSTZmp1c2/Concept-Board?node-id=0-1&p=f&t=img3rV4vu2yZZR52-0)

## Data-Sources Catalogue
---

### 1. **[Belgian Parliament] Flanders Region**
- **Scraping:** Official meeting calendar and details from the Flemish Parliament. (Flanders Region - Belgium)
- **Reason:** Tracks legislative sessions, committee meetings, and agendas for transparency and research on Belgian regional politics.
- **Description:** Official portal of the Flemish Parliament—the unicameral legislature for the Flemish Community and Region of Belgium—where agendas, committee meetings, live streams and verbatim records are published for public scrutiny. The “Vergaderingen en verslagen” calendar hosts a searchable log of every sitting that feeds our scraper. [vlaamsparlement.be](https://www.vlaamsparlement.be/nl/parlementair-werk/vergaderingen-en-verslagen)[docs.vlaamsparlement.be](https://docs.vlaamsparlement.be/docs/varia/brochures/Infobrochures%20update%202021/VP_A5%20brochure%20ENG_Versie_0521_DRUK.pdf)
- **URL Pattern:**  
  `https://www.vlaamsparlement.be/nl/parlementair-werk/vergaderingen-en-verslagen?period={YYYY-MM-DD}&view=day`
- **Data Scraped:**  
  - **Meetings per day**: For each day in the range, all meetings are scraped.
  - **Fields:**  
    - `id`: Meeting ID (from URL)
    - `title`, `title_en`: Title (Dutch and translated English)
    - `description`, `description_en`: Description (Dutch and translated English, full if truncated)
    - `meeting_date`: Date and time
    - `location`: Meeting location
    - `meeting_url`: Direct link to meeting details
    - `embedding_input`: Concatenated string for embedding
- **Comments:** 
	- Scrapes one day at a time; iterates over a date range.
	- Uses Playwright for browser automation (headless Chromium).
	- If meeting descriptions are truncated ("..."), the scraper follows the detail link to fetch the full description.
	- Translates titles and descriptions to English using an internal translation utility.
	- Meeting IDs are parsed from URLs, which may change if the website structure changes.

---

### 2. **[Bundestag Drucksachen] (German Parliament)**
- **Scraping:** Official documents, bills, and reports from the German Bundestag.
- **Reason:** Provides primary legislative texts and supporting documents for German federal lawmaking.
- **Description:** DIP (Dokumentations- und Informationssystem) is the German Bundestag’s public database that stores all printed papers (“Drucksachen”) and accompanying metadata from both the Bundestag and Bundesrat. It is the authoritative source for bills, motions and reports as they move through the federal legislative process. [Deutscher Bundestag](https://www.bundestag.de/en/documents/parliamentary_documentation)
- **API Endpoints:**  
  - List: `https://search.dip.bundestag.de/api/v1/drucksache?page={page}&size=50&f.datum.start={YYYY-MM-DD}&f.datum.end={YYYY-MM-DD}`
  - Document text: `https://search.dip.bundestag.de/api/v1/drucksache-text/{id}`
- **Data Scraped:**  
  - **Official documents ("Drucksachen")**: Parliamentary bills, motions, reports, etc.
  - **Fields:**  
    - `id`: Document ID
    - `datum`: Date
    - `titel`: Title (German)
    - `drucksachetyp`: Document type
    - `text`: Full document text
    - `title_english`: Translated title
- **Comments:**
	- Uses the Bundestag’s official API, requiring an API key (set via environment variable).
	- Fetches both metadata and full document text for each item.
	- Translates titles to English.
	- Handles pagination and can resume from the last processed entry.
	- If the API key is missing or invalid, the scraper will fail.

---

### 3. **[Bundestag Plenarprotokolle] (German Parliament)**
- **Scraping:** Full transcripts of German Bundestag plenary sessions.
- **Reason:** Enables analysis of debates, speeches, and voting behavior in Germany’s federal parliament.
- **Description:** The same DIP platform also offers full stenographic transcripts (“Plenarprotokolle”) of every plenary sitting, allowing researchers to read speeches, interventions and vote results verbatim. These transcripts are linked to the corresponding bills and are permanently archived on the Bundestag site. [Deutscher Bundestag](https://www.bundestag.de/en/documents/parliamentary_documentation)
- **API Endpoints:**  
  - List: `https://search.dip.bundestag.de/api/v1/plenarprotokoll?page={page}&size=50&f.datum.start={YYYY-MM-DD}&f.datum.end={YYYY-MM-DD}`
  - Protocol text: `https://search.dip.bundestag.de/api/v1/plenarprotokoll-text/{id}`
- **Data Scraped:**  
  - **Plenary session protocols**: Full transcripts of Bundestag sessions.
  - **Fields:**  
    - `id`: Protocol ID
    - `datum`: Date
    - `titel`: Title
    - `sitzungsbemerkung`: Session remarks
    - `text`: Full protocol text
    - `title_english`: Translated title
- **Comments:**
	- Also uses the Bundestag’s official API and requires an API key.
	- Fetches both metadata and full protocol text for each session.
	- Handles pagination and can resume from the last processed entry.
	- Translates titles to English.
	- Large result sets may require multiple paginated requests.

---

### 4. **[EC Meetings] EC Research & Innovation Meetings**
- **Scraping:** Events, conferences, and workshops from the European Commission’s research and innovation portal.
- **Reason:** Monitors EU-level scientific and innovation policy events, useful for stakeholders and researchers.
- **Description:** Events pages on research-and-innovation.ec.europa.eu are run by the European Commission’s Directorate-General for Research & Innovation and advertise conferences, info-days and stakeholder workshops connected to EU R&I policy and programmes such as Horizon Europe. Each listing contains dates, venue and thematic focus, making the site a one-stop calendar for the EU research community. [Research and innovation](https://research-and-innovation.ec.europa.eu/events_en)
- **URLs:**  
  - Main: `https://research-and-innovation.ec.europa.eu/events/upcoming-events_en?f[0]=oe_event_event_date:bt|{start_date}|{end_date}&page={page}`
  - RSS: `https://research-and-innovation.ec.europa.eu/node/4/rss_en?f[0]=oe_event_event_date:bt|{start_date}|{end_date}`
- **Data Scraped:**  
  - **EU research and innovation events**: Conferences, workshops, info days, etc.
  - **Fields:**  
    - `id`: Event ID
    - `title`: Event title
    - `meeting_url`: Event detail page
    - `start_date`, `end_date`: Dates
    - `location`: Event location
    - `event_type`: Type of event
    - `description`: Event description
    - `subjects`: List of topics/subjects
    - `embedding_input`: For embedding
- **Comments:**
	- Scrapes both the main events page and the RSS feed, then merges results.
	- Uses Scrapy and asynchronous crawling.
	- Handles date range filtering and pagination.
	- Merges data from different sources (RSS and HTML) for completeness.
	- If the number of RSS items hits a limit, the date range is split and retried recursively.

---

### 5. **[IPEX Calendar] IPEX (Inter-Parliamentary EU information eXchange)**
- **Scraping:** Interparliamentary EU events and meetings, via the IPEX platform.
- **Reason:** Tracks cross-national parliamentary cooperation and EU-wide legislative events.
- **Description:** IPEX (Inter-Parliamentary EU information eXchange) is a collaborative platform maintained by national parliaments and the European Parliament to share EU-related parliamentary information. Its event calendar lists upcoming inter-parliamentary conferences, COSAC meetings and other fora for cross-chamber cooperation. [European Parliament](https://www.europarl.europa.eu/relnatparl/en/networks/ipex)
- **API Endpoint:**  
  `https://ipex.eu/IPEXL-WEB/api/search/event?appLng=EN` (POST with date range)
- **Data Scraped:**  
  - **Interparliamentary EU events**: Meetings, conferences, and events from the IPEX calendar.
  - **Fields:**  
    - `id`: Event identifier
    - `title`: Event title
    - `start_date`, `end_date`: Dates
    - `meeting_location`: Location
    - `tags`: Keywords/labels
    - `embedding_input`: For embedding
- **Comments:** 
	- Uses a POST request to the IPEX API with JSON body containing date range and filters.
	- Handles pagination internally.
	- Extracts event details from nested JSON fields.
	- If the API structure changes, the scraper may need updates.

---

### 6. **[LawTracker] EU Law Procedures**
- **Scraping:** EU legislative procedures, filtered by topic, from the LawTracker platform.
- **Reason:** Follows the progress and status of EU laws, supporting legal research and policy tracking.
- **Description:** Launched in 2024, the EU Law Tracker on eur-lex.europa.eu visualises every step of ordinary legislative procedures—from Commission proposal to final adoption—in plain language. It aggregates metadata, actors and deadlines so citizens can follow a file’s progress in real time. [EUR-Lex](https://eur-lex.europa.eu/collection/legislative-procedures.html)
- **URL Pattern:**  
  `https://law-tracker.europa.eu/results?eurovoc=%5B%22{topic_code},DOM%22%5D&searchType=topics&sort=DOCD_DESC&page={page}&pageSize=50&lang=en`
- **Data Scraped:**  
  - **EU legislative procedures**: Laws and procedures filtered by topic.
  - **Fields:**  
    - `id`: Procedure ID
    - `title`: Title
    - `status`: Status (e.g., adopted, ongoing)
    - `active_status`: Current activity status
    - `started_date`: Start date
    - `topic_codes`, `topic_labels`: Topic codes and labels
    - `embedding_input`: For embedding
- **Comments:**
	- Scrapes by topic code, iterating over all defined topics.
	- Uses Scrapy with Playwright for JavaScript-rendered pages.
	- Handles pagination for each topic.
	- Upserts (inserts or updates) laws in the database, merging topic codes/labels if needed.
	- Compares all fields to avoid unnecessary updates.

---

### 7. **[Legislative Observatory] EU OEIL (Observatoire Européen Institutionnel Législatif)**
- **Scraping:** Status and progress of EU legislative files from the European Parliament’s OEIL system.
- **Reason:** Offers a comprehensive view of EU lawmaking, including actors, events, and documentation.
- **Description:** OEIL is the European Parliament’s long-standing “Legislative Observatory”, a public database that monitors EU decision-making across all institutions, offering dossiers with timelines, responsible committees, rapporteurs and linked documents. It is considered the most comprehensive record of EU legislative activity. [oeil.secure.europarl.europa.eu](https://oeil.secure.europarl.europa.eu/)
- **URLs:**  
  - Export: `https://oeil.secure.europarl.europa.eu/oeil/en/search/export/XML`
  - Details: `https://oeil.secure.europarl.europa.eu/oeil/en/procedure-file?reference={id}`
- **Data Scraped:**  
  - **EU legislative files**: Status, progress, and details of EU legislation.
  - **Fields:**  
    - `id`: Procedure reference
    - `link`: Main link
    - `title`: Title
    - `lastpubdate`: Last publication date
    - `committee`, `rapporteur`: Committee and rapporteur
    - `status`: Current status
    - `subjects`: List of subjects
    - `key_players`: Committees, rapporteurs, shadow rapporteurs
    - `key_events`: Timeline of key events
    - `documentation_gateway`: Linked documents
    - `embedding_input`: For embedding
- **Comments:**
	- Starts from an XML export, then follows up with detail page requests for each procedure.
	- Uses Scrapy and XPath/CSS selectors for parsing.
	- Extracts complex nested data: key players, events, documentation.
	- Notifies subscribers if a legislative status changes.
	- Handles fuzzy matching for duplicate detection.

---

### 8. **[MEC Prep Bodies Meetings] Council of the EU – Preparatory-Bodies Calendar**
- **Scraping:** Meetings of preparatory bodies (working parties, committees) of the Council of the EU.
- **Reason:** Reveals the behind-the-scenes work that shapes EU Council decisions.
- **Description:** The meetings calendar on consilium.europa.eu lists more than 150 specialised working parties and committees that prepare Council decisions. Updated daily by the Council’s General Secretariat, it shows date, venue and subject for each technical meeting. [Consilium](https://www.consilium.europa.eu/en/meetings/calendar/)
- **URL Pattern:**  
  `https://www.consilium.europa.eu/en/meetings/calendar/?DateFrom={YYYY/MM/DD}&DateTo={YYYY/MM/DD}&category=mpo&page={page}`
- **Data Scraped:**  
  - **Preparatory bodies meetings**: Meetings of working parties, committees, etc.
  - **Fields:**  
    - `id`: Meeting ID (from URL)
    - `url`: Meeting detail URL
    - `title`: Meeting title
    - `meeting_timestamp`: Date and time
    - `meeting_location`: Location (if available)
    - `embedding_input`: For embedding
- **Comments:**
	- Uses an asynchronous crawler (crawl4ai).
	- Scrapes by date range and paginates through results.
	- Extracts meeting links and details from the list view; does not always fetch detail pages.
	- Meeting IDs are parsed from URLs.
	- Handles bot protection and may log warnings if scraping is blocked.

---

### 9. **[MEC Sum Minist Meetings] Council of the EU – Summits & Ministerials**
- **Scraping:** Summits and ministerial meetings of the Council of the EU.
- **Reason:** Captures high-level decision-making and policy direction at the EU’s intergovernmental level.
- **Description:** The same Council calendar also features high-level European Council summits, sectoral Council configurations and informal ministerial meetings, giving a forward view of top-tier EU decision-making. Entries include start/end dates, host city and broad agenda. [Consilium](https://www.consilium.europa.eu/en/meetings/calendar/)
- **URL Pattern:**  
  `https://www.consilium.europa.eu/en/meetings/calendar/?DateFrom={YYYY/MM/DD}&DateTo={YYYY/MM/DD}&category=meeting&page={page}`
- **Data Scraped:**  
  - **Summit and ministerial meetings**: High-level Council meetings.
  - **Fields:**  
    - `url`: Meeting detail URL
    - `title`: Meeting title
    - `meeting_date`, `meeting_end_date`: Start and end dates
    - `category_abbr`: Meeting category abbreviation
    - `embedding_input`: For embedding
- **Comments:**
	- Similar to the prep bodies scraper, but targets a different category.
	- Handles date ranges that may span months or years.
	- Parses meeting dates from URL patterns.
	- Handles pagination and deduplication of meetings that span multiple days.

---

### 10. **[EP Meeting Calendar] EP Plenary/Committee Meeting Search**
- **Scraping:** Plenary and committee meeting schedules from the European Parliament.
- **Reason:** Essential for tracking the legislative agenda and activities of the EU’s directly elected body.
- **Description:** The “Meetings-search” tool on europarl.europa.eu/plenary lets users query past and upcoming plenary sittings and committee meetings by date. Each result page links to agendas, documents and live-streaming info provided by the European Parliament. [European Parliament](https://www.europarl.europa.eu/plenary/en/agendas.html)
- **URL Pattern:**  
  `https://www.europarl.europa.eu/plenary/en/meetings-search.html?isSubmitted=true&dateFrom={DD%2FMM%2FYYYY}&townCode=&loadingSubType=false&meetingTypeCode=&retention=TODAY&page={page}`
- **Data Scraped:**  
  - **European Parliament plenary meetings**: All meetings for a given date.
  - **Fields:**  
    - `datetime`: Date and time
    - `title`: Meeting title
    - `subtitles`: Subtitles (e.g., session type)
    - `place`: Location
    - `embedding_input`: For embedding
- **Comments:**
	- Scrapes one day at a time, paginating through results for each day.
	- Uses BeautifulSoup for HTML parsing.
	- Extracts meeting details from structured HTML.
	- Handles missing or malformed data gracefully.
	- Stores each meeting with a composite embedding string.

---

### 11. **[MEP Meetings] MEP Meetings Register**
- **Scraping:** Official meetings of Members of the European Parliament, including attendees.
- **Reason:** Provides insight into MEP activities, lobbying, and transparency.
- **Description:** Within Parliament’s “Ethics & Transparency” section, the “Search MEP meetings” interface publishes the mandatory disclosure of official meetings between MEPs and interest-representatives, listing date, place, theme and participants. It underpins transparency rules introduced after 2019. [European Parliament](https://www.europarl.europa.eu/meps/en/search-meetings)
- **URL Pattern:**  
  `https://www.europarl.europa.eu/meps/en/search-meetings?fromDate={DD/MM/YYYY}&toDate={DD/MM/YYYY}&page={page}`
- **Data Scraped:**  
  - **Meetings of Members of the European Parliament**: Official meetings, including attendees.
  - **Fields:**  
    - `title`: Meeting title
    - `member_name`: MEP name
    - `meeting_date`: Date
    - `meeting_location`: Location
    - `member_capacity`: Role/capacity
    - `procedure_reference`: Related procedure
    - `associated_committee_or_delegation_code`, `associated_committee_or_delegation_name`
    - `attendees`: List of attendees (name, transparency register URL)
    - `embedding_input`: For embedding
- **Comments:**
	- Uses Scrapy to crawl the official MEP meetings search.
	- Handles pagination and date range filtering.
	- Extracts attendees, including transparency register URLs.
	- Deduplicates meetings using fuzzy title matching.
	- Maps attendees to meetings in a separate table.

---

### 12. **[Netherlands TWKA Meetings] Dutch House of Representatives (Tweede Kamer) Agenda**
- **Scraping:** Daily agenda and meeting details from the Dutch House of Representatives (Tweede Kamer).
- **Reason:** Enables monitoring of Dutch national legislative activity and committee work.
- **Description:** Debat & Vergadering on tweedekamer.nl provides the daily schedule of plenary sessions and committee meetings of the Dutch lower house, with live-stream links and background files. The agenda is organised by date and is the primary transparency channel for Dutch parliamentary business. [tweedekamer.nl](https://www.tweedekamer.nl/debat_en_vergadering)
- **Agenda by Date:**  
  `https://www.tweedekamer.nl/debat_en_vergadering?date={DD-MM-YYYY}`
- **Meeting Details:**  
  URLs found in `data-href` or `<a>` tags, e.g.  
  `https://www.tweedekamer.nl{data-href}`
- **Data Scraped:**  
  - **Dutch House of Representatives meetings**: All meetings for a given date.
  - **Fields:**  
    - `id`: Meeting ID (from detail URL)
    - `meeting_type`: Type (e.g., "Notaoverleg")
    - `title`, `original_title`, `translated_title`: Title (Dutch and English)
    - `start_datetime`, `end_datetime`: Start/end times
    - `location`: Location
    - `link`: Detail page URL
    - `attachments_url`: List of attachment URLs
    - `commission`: Committee name
    - `agenda`: List of agenda items
    - `ministers`, `attendees`: Lists of names
    - `embedding_input`: For embedding
- **Comments:**
	- Scrapes the agenda for each day in the date range.
	- Follows detail links for each meeting to extract full information.
	- Translates titles to English, with manual overrides for common meeting types.
	- Extracts agenda, ministers, and attendees from detail pages.
	- Handles missing or malformed data with fallbacks.

---

### 13. **[Polish Presidency Meetings] Polish EU-Council Presidency Events**
- **Scraping:** Events and meetings organized under the Polish Presidency of the Council of the EU.
- **Reason:** Tracks the priorities and activities of the rotating EU Council presidency.
- **Description:** polish-presidency.consilium.europa.eu hosts the official calendar for Poland’s 2025 Presidency of the Council of the EU, listing every presidency-branded meeting—from Coreper to ministerials and cultural events—across Brussels, Luxembourg and Poland. [Polish Presidency of the EU](https://polish-presidency.consilium.europa.eu/en/events/)
- **URL Pattern:**  
  `https://polish-presidency.consilium.europa.eu/events/print/?StartDate={YYYY-MM-DD}&EndDate={YYYY-MM-DD}`
- **Data Scraped:**  
  - **Meetings during the Polish EU Council Presidency**: All events in the date range.
  - **Fields:**  
    - `id`: Meeting slug (from URL)
    - `title`: Meeting title
    - `meeting_date`, `meeting_end_date`: Dates
    - `meeting_location`: Location
    - `meeting_url`: Detail page URL
    - `embedding_input`: For embedding
- **Comments:**
	- Scrapes a print-friendly events page with date range filtering.
	- Extracts meetings grouped by date.
	- Handles multi-day meetings by updating the end date if the same meeting appears on multiple days.
	- Meeting IDs are parsed from URLs.

---

### 14. **[Spanish Commission Meetings] Spanish Congress (Congreso de los Diputados) Agenda**
- **Scraping:** Commission and committee meetings from the Spanish Congress of Deputies.
- **Reason:** Follows Spanish national legislative processes and committee work.
- **Description:** congreso.es publishes a day-by-day agenda of plenary sittings and committee meetings of Spain’s lower chamber, including session notes, press releases and live video. It is the main information channel for parliamentary proceedings in Madrid. [Congreso](https://www.congreso.es/en/home)
- **URL Pattern:**  
  `https://www.congreso.es/en/agenda?p_p_id=agenda&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_agenda_mvcPath=cambiaragenda&_agenda_tipoagenda=1&_agenda_dia={DD}&_agenda_mes={MM}&_agenda_anio={YYYY}`
- **Data Scraped:**  
  - **Spanish parliamentary commission meetings**: All meetings for a given day.
  - **Fields:**  
    - `date`, `time`: Date and time
    - `title`, `title_en`: Title (Spanish and English)
    - `location`, `location_en`: Location (Spanish and English)
    - `description`, `description_en`: Description (Spanish and English)
    - `url`: Main link (if available)
    - `links`: Dictionary of additional links
    - `embedding_input`: For embedding
- **Comments:**
	- Scrapes the agenda for a specific day.
	- Translates titles and descriptions to English.
	- Handles cases where the agenda structure varies (e.g., missing links or descriptions).
	- Deduplicates entries using fuzzy matching.

---

### 15. **[Weekly Agenda] European Parliament Weekly Agenda**
- **Scraping:** Weekly overview of all events and sessions in the European Parliament.
- **Reason:** Offers a high-level view of the Parliament’s activities and priorities.
- **Description:** The “Weekly Agenda” page on the EP Newsroom offers a media-oriented snapshot of all parliamentary activities for a given ISO week—plenary votes, committee hearings, delegation trips and press points—so journalists can plan coverage. [European Parliament](https://www.europarl.europa.eu/news/en/agenda/weekly-agenda)
- **URL Pattern:**  
  `https://www.europarl.europa.eu/news/en/agenda/weekly-agenda/{YYYY}-{WW}`
- **Data Scraped:**  
  - **Weekly agenda of the European Parliament**: All events for each week.
  - **Fields:**  
    - `type`: Event type (e.g., plenary, committee)
    - `date`, `time`: Date and time
    - `title`: Event title
    - `committee`: Committee (if applicable)
    - `location`: Location
    - `description`: Description
    - `embedding_input`: For embedding
- **Comments:**  
	- URL: {WW} is the ISO week number.
	- Scrapes the weekly agenda page for each ISO week in the date range.
	- Extracts all event types (plenary, committee, delegations, etc.).
	- Uses multiple parsing functions for different event types.
	- Handles missing or malformed data gracefully.
	- Deduplicates entries using fuzzy matching.

---

### 16. **Tweets (EU Institution Accounts)**
- **Scraping:** Recent tweets from major EU institutions and news sources.
- **Reason:** Captures real-time communication, announcements, and public engagement from key EU actors.
- **Description:** Twitter (X) - EU institutions and news outlets post real-time announcements, statements and multimedia; our scraper follows a curated list of official accounts to capture timely updates. [en.wikipedia.org](https://en.wikipedia.org/wiki/Twitter)
- **API Endpoint:**  
  `https://api.twitterapi.io/twitter/user/last_tweets` (and user info endpoint)
- **Data Scraped:**  
  - **Tweets from selected accounts**: Recent tweets from e.g. EU_Commission, EUCouncil, etc.
  - **Fields:**  
    - `id`: Tweet ID
    - `created_at`: Timestamp
    - `text`: Tweet content
    - `user_id`, `username`: Author info
    - `embedding_input`: For embedding
- **Comments:** 
	- Uses Twitter API via a proxy, not direct scraping of twitter.com.
	- Requires an API key (configured in settings).
	- Handles pagination via cursors and recursion.
	- Scrapes tweets for a fixed lookback period (default: 1 day).
	- If the API quota is exceeded or the key is missing, scraping will fail.

---


Fig Jam Overview Link: https://www.figma.com/board/aiuBPTYWxoqA0ZSTZmp1c2/Concept-Board?node-id=0-1&p=f&t=img3rV4vu2yZZR52-0

