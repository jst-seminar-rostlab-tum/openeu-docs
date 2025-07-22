---
sidebar_position: 1
---

# Introduction

**Author:** `Leon Schmid`

The OpenEU Backend is built using **FastAPI** and deployed on **Render**, leveraging a modern Python architecture with comprehensive data collection, AI-powered processing, and robust authentication. The system integrates multiple European parliamentary data sources through automated scrapers and provides intelligent analysis through LLM services.

---

## 🛠 Core Framework & Runtime

- [**FastAPI**](https://fastapi.tiangolo.com/) – Modern, fast web framework for building APIs with automatic OpenAPI documentation.
- [**Python 3.13**](https://www.python.org/) – Latest Python runtime with enhanced performance and type safety.
- [**Uvicorn**](https://www.uvicorn.org/) – Lightning-fast ASGI server implementation.
- [**Poetry**](https://python-poetry.org/) – Modern dependency management and packaging tool.

---

## 🗄️ Database & Authentication

- [**Supabase**](https://supabase.com/) – PostgreSQL database with real-time subscriptions, authentication, and API generation.
- [**PostgreSQL**](https://www.postgresql.org/) – Robust relational database with advanced querying capabilities.
- [**JWT Authentication**](https://jwt.io/) – Secure token-based authentication with Supabase integration.

---

## 🤖 AI & Machine Learning

- [**OpenAI**](https://openai.com/) – GPT models for intelligent text processing and analysis.
- [**Cohere**](https://cohere.ai/) – Enterprise-grade language models for text understanding.
- [**LangChain**](https://www.langchain.com/) – Framework for developing applications with language models.

---

## 🕷️ Data Collection & Web Scraping

- [**Scrapy**](https://scrapy.org/) – Professional web scraping framework for large-scale data extraction.
- [**Playwright**](https://playwright.dev/) – Browser automation for dynamic content scraping.
- [**crawl4ai**](https://crawl4ai.com/) – AI-powered web crawling and content extraction.
- [**BeautifulSoup)**](https://www.crummy.com/software/BeautifulSoup/) – HTML/XML parsing library.
- [**Requests**](https://requests.readthedocs.io/) – HTTP library for API integrations.

---

## 📧 Communication & Translation

- [**Brevo**](https://www.brevo.com/) – Transactional email service for notifications and alerts.
- [**OpenAI Translation**](https://openai.com/) – Custom LLM-powered multilingual translation to English with custom prompt.
- [**Jinja2**](https://jinja.palletsprojects.com/) – Modern templating engine for email and document generation.

---

## ⚡ Performance & Caching

- [**FastAPI-Cache2**](https://github.com/long2ice/fastapi-cache) – High-performance caching with in-memory backend.
- [**rapidfuzz**](https://github.com/maxbachmann/RapidFuzz) – Fast string matching and fuzzy search.

---

## 🔄 Background Jobs & Scheduling

- [**schedule**](https://schedule.readthedocs.io/) – Python job scheduling library for automated tasks.
- **Custom JobScheduler** – Enhanced scheduling wrapper with timeout handling and error tracking.
- **Background Processing** – Process-based and thread-based execution for different job types.
- For detailed information, see our [Scheduling & Jobs documentation](./scheduling_jobs.md).

---

## 🧪 Code Quality & Linting

- [**Ruff**](https://github.com/astral-sh/ruff) – Extremely fast Python linter and formatter (replaces Black, isort, flake8).
- [**MyPy**](https://mypy.readthedocs.io/) – Static type checker for Python code.
- [**pre-commit**](https://pre-commit.com/) – Git hooks for automated code quality checks.
- **Type Hints** – Comprehensive type annotations for better IDE support and error detection.

---

## 🐳 Deployment & Infrastructure

- [**Render**](https://render.com/) – Cloud deployment platform with automatic builds and scaling.
- [**Docker**](https://www.docker.com/) – Containerization for consistent development and deployment environments.
- [**GitHub Actions**](https://github.com/features/actions) – Automated CI/CD pipeline for testing and deployment.
- [**Supabase Branching**](https://supabase.com/docs/guides/deployment/branching) – Database preview deployments for feature development.

---

## 🔐 Security Features

- **JWT Token Validation** – Secure authentication with Supabase
- **API Key Protection** – Background job endpoints secured with tokens
- **CORS Policy** – Restricted to approved domains (localhost, netlify.app, openeu.csee.tech)
- **Environment Isolation** – Development vs. production configuration separation

---
