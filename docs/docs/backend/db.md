---
sidebar_position: 3
---

# DB

**Author**: `Daniel Bier`

## Overview

The OpenEU project uses [Supabase](https://supabase.com/) as its database platform. This document outlines the key database concepts, workflows, and best practices for managing the database.

## Project Structure

The database configuration is maintained in the following directory structure:

```
openeu-backend/
├── supabase/
│   ├── migrations/    # Generated SQL migration files
│   ├── schemas/       # Declarative schema definitions
│   ├── config.toml    # Supabase configuration
│   └── seed.sql       # Initial seed data
```

## Declarative Schemas

We use a declarative approach to define our database schema. This means:

1. Database objects (tables, views, functions, etc.) are defined in SQL files in the `schemas/` directory
2. These files serve as the source of truth for the database structure
3. Changes to the schema should be made by modifying these files, not by editing or creating migrations manually

### Benefits of Declarative Schemas

- **Version control**: All database changes are tracked in Git
- **Documentation**: Schema files serve as self-documenting code
- **Reproducibility**: Easy to recreate the database from scratch

## Working with Migrations

Migrations are SQL scripts that transform the database from one state to another. They are used to apply schema changes in a controlled manner.

### Migration Workflow

1. **Only** make changes to the declarative schema files
2. Generate migrations from schema changes
3. Commit the migrations along with schema changes
4. Migrations are applied automatically during deployment

### Generating Migrations

When you need to make schema changes:

```bash
# 1. Merge main into your branch to get the latest schema
git merge main

# 2. If you have new tables that don't exist on remote:
supabase stop

# 3. Generate a new migration with your changes
supabase db diff -f migration_name

# 4. Start Supabase again
supabase start

# 5. Reset local DB to apply the new schema
supabase db reset
```

### Migration Rules

- **Never** push changes directly with `supabase db push`
- **Never** edit migration files after they've been committed
- **Only** modify the schema itself (in the schemas directory)
- Migrations are applied automatically when merged to main

## Local Development Setup

To work with the database locally:

1. Install the Supabase CLI
2. Start a local Supabase instance: `supabase start`
3. Connect to your local database using the provided connection string

### Environment Variables

The following environment variables are required:

```
SUPABASE_API_KEY     # API key for authentication
SUPABASE_PROJECT_URL # URL of the Supabase project
```

These can point to either:
- Your local Supabase instance (for development)
- The remote Supabase project (for testing against production)

## Deployment and Preview Environments

When you push a branch to GitHub:

1. A Supabase preview environment is automatically created (for reference, see [Supabase Branching](../backend/deployment.md#supabase-preview-environments-branching))
2. The migrations are applied to this preview environment
3. This allows testing database changes in isolation before merging to main

When a PR is merged to main:
1. The pipeline deploys changes to the production Supabase instance
2. Migrations are applied automatically in the correct order

## Troubleshooting

### Common Issues

1. **Migration Conflicts**:
   - Always merge main before generating migrations
   - If conflicts occur, create a fresh branch from main and reapply your changes

2. **Failed Migrations**:
   - Check migration syntax before committing
   - Test migrations on a local database first
   - Review error logs in the Supabase dashboard

3. **Local/Remote Differences**:
   - Use `supabase db reset` to ensure your local matches the schema
   - Verify environment variables are pointing to the correct instance

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
