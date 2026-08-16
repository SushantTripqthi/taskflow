# TaskFlow

TaskFlow is a full-stack task and project management application built with FastAPI, SQLAlchemy, SQLite, HTML, CSS, and JavaScript. It manages users, projects, and tasks through one relational backend and includes custom sorting/searching algorithms and a deterministic Quick-Add parser.

## Features

- User management
- Project management
- Task CRUD
- Project-level task statistics
- Custom insertion sort
- Binary search and linear search
- Comparison-counting benchmark
- Deterministic, keyless Quick-Add parser
- Pydantic validation
- SQLAlchemy ORM relationships
- Shared database-session dependency
- Request logging middleware
- Explicit CORS configuration
- Automated algorithm checks
- Frontend integration with the real backend

## Technology Stack

### Backend

- Python 3.10+
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- SQLite
- REST/JSON APIs

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API
- DOM APIs
- localStorage

## Repository Structure

```text
TaskFlow/
├── backend/
│   ├── ai/
│   │   ├── __init__.py
│   │   └── quick_add_parser.py
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── binary_search.py
│   │   ├── comparison_algorithms.py
│   │   ├── comparison_counter.py
│   │   ├── insertion_sort.py
│   │   └── linear_search.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── request_logging.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── project_model.py
│   │   ├── task_model.py
│   │   └── user_model.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── project_repository.py
│   │   ├── task_repository.py
│   │   └── user_repository.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── project_router.py
│   │   ├── task_router.py
│   │   └── user_router.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── project_schema.py
│   │   ├── task_schema.py
│   │   └── user_schema.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── project_service.py
│   │   ├── statistics_service.py
│   │   ├── task_service.py
│   │   └── user_service.py
│   ├── app.py
│   ├── benchmark.py
│   ├── check_algorithms.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   └── results.txt
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── .gitignore
├── README.md
└── requirements.txt

```

## Data Model

TaskFlow uses three related entities:

```text
User
  |
  | 1-to-many
  v
Project
  |
  | 1-to-many
  v
Task
```

Relationships:

```text
projects.owner_id  -> users.id
tasks.project_id   -> projects.id
```

Task priority is restricted to:

```text
low
medium
high
```

`due_date` is nullable text so values such as `2026-12-01` and parser-generated phrases such as `next friday` can both be stored.

## Environment Setup

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Running the Backend

From the `backend` directory:

```powershell
uvicorn app:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

OpenAPI schema:

```text
http://127.0.0.1:8000/openapi.json
```

## Running the Frontend

Using the recommended two-process setup:

```powershell
cd frontend
python -m http.server 5500
```

Open:

```text
http://127.0.0.1:5500
```

The frontend calls the backend at:

```text
http://127.0.0.1:8000
```

## API Endpoints

### Users

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/users/` | Create user |
| GET | `/users/` | List users |
| GET | `/users/{user_id}` | Get user |
| PUT | `/users/{user_id}` | Update user |
| DELETE | `/users/{user_id}` | Delete user |

Example request:

```json
{
  "name": "SushantMani",
  "email": "tripathi@example.com"
}
```

Example response:

```json
{
  "id": 1,
  "name": "SushantMani",
  "email": "tripathi@example.com"
}
```

### Projects

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/projects/` | Create project |
| GET | `/projects/` | List projects |
| GET | `/projects/{project_id}` | Get project |
| PUT | `/projects/{project_id}` | Update project |
| DELETE | `/projects/{project_id}` | Delete project |
| GET | `/projects/{project_id}/stats` | Project task statistics |

Example request:

```json
{
  "name": "TaskFlow Backend",
  "description": "Backend implementation and testing",
  "owner_id": 1
}
```

### Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/tasks/` | Create task |
| GET | `/tasks/` | List tasks |
| GET | `/tasks/{task_id}` | Get task |
| PUT | `/tasks/{task_id}` | Update task |
| DELETE | `/tasks/{task_id}` | Delete task |
| GET | `/tasks/search-by-id/{task_id}` | Search task by ID |
| GET | `/tasks/search` | Search task by exact title |
| POST | `/tasks/quick-add` | Quick-Add task |

## Task Sorting

Priority sorting uses the custom insertion-sort implementation.

```text
GET /tasks/?sort=priority
```

Order:

```text
low -> medium -> high
```

The endpoint does not use Python's built-in `sorted()` or `list.sort()` for this required operation.

## Task Search

Linear search:

```text
GET /tasks/search?title=Test%20APIs&algo=linear
```

Binary search:

```text
GET /tasks/search?title=Test%20APIs&algo=binary
```

Binary search first sorts the in-memory task index by title using the custom insertion sort. Linear search scans the unsorted index sequentially.

An exact-title miss returns HTTP `404`.

## Quick-Add

Endpoint:

```text
POST /tasks/quick-add
```

Request:

```json
{
  "description": "Complete backend testing tomorrow with high priority",
  "project_id": 1
}
```

Example response:

```json
{
  "id": 5,
  "title": "Complete backend testing",
  "description": "Complete backend testing tomorrow with high priority",
  "priority": "high",
  "due_date": "tomorrow",
  "project_id": 1
}
```

Quick-Add writes the task into the same `tasks` table used by normal CRUD endpoints.

### Quick-Add Processing

The parser:

1. Creates a lower-case working copy for keyword matching.
2. Determines priority.
3. Determines the first matching date phrase.
4. Removes the matched priority/date spans from the original-cased description when building the title.
5. Trims whitespace.
6. Uses `Untitled task` when the resulting title is empty.

The required baseline performs zero network calls and requires zero API keys.

### Prompting Technique Rationale

The Quick-Add design follows a role-based prompting structure: a system-level instruction defines the expected parsing behavior and a user-level message carries the free-text task description. The required implementation is deterministic rather than dependent on an external LLM.

This is closest to a zero-shot approach because the expected behavior is specified directly instead of depending on a few-shot example set or chain-of-thought reasoning. This keeps prompt size smaller and reduces token usage. It also improves reliability because the keyless parser returns the same result for the same input and does not depend on network availability, model availability, or a paid service.

A real LLM can be added only as an optional enhancement behind a feature flag; the deterministic parser remains the baseline.

## Quick-Add Worked Examples

### Example 1

Input:

```text
This is urgent, mark it ASAP please
```

Output:

```json
{
  "title": "This is , mark it please",
  "priority": "high",
  "due_date_hint": null
}
```

### Example 2

Input:

```text
"   "
```

Output:

```json
{
  "title": "Untitled task",
  "priority": "medium",
  "due_date_hint": null
}
```

### Example 3

Input:

```text
Finish the report next Friday, it's urgent
```

Output:

```json
{
  "title": "Finish the report , it's",
  "priority": "high",
  "due_date_hint": "next friday"
}
```

### Example 4

Input:

```text
tomorrow review tomorrow
```

Output:

```json
{
  "title": "review",
  "priority": "medium",
  "due_date_hint": "tomorrow"
}
```

### Example 5

Input:

```text
Complete backend testing tomorrow with high priority
```

Output:

```json
{
  "title": "Complete backend testing",
  "priority": "high",
  "due_date_hint": "tomorrow"
}
```

## Algorithms

### Insertion Sort

```python
insertion_sort(records, key)
```

Sorts the list in place.

For priority:

```text
low = 1
medium = 2
high = 3
```

Complexity:

- Best case: `O(n)`
- Worst case: `O(n²)`
- Auxiliary space: `O(1)`

### Binary Search

```python
binary_search(sorted_records, target_value, key)
```

Uses the standard low/high/mid pointer approach.

Complexity:

- Best case: `O(1)`
- Worst case: `O(log n)`
- Auxiliary space: `O(1)`

### Linear Search

```python
linear_search(records, target_value, key)
```

Scans records sequentially and returns the first exact match.

Complexity:

- Best case: `O(1)`
- Worst case: `O(n)`
- Auxiliary space: `O(1)`

## Why Sort First for Binary Search?

Binary search requires ordered data. TaskFlow therefore sorts the task index with insertion sort before performing a binary-search lookup.

The initial sorting cost is `O(n²)` with insertion sort, while each binary-search lookup is `O(log n)`. Therefore, sorting first is most useful when an ordered index can be reused for multiple searches. The benchmark makes this trade-off visible through actual comparison counts.

## Benchmark

Run:

```powershell
cd backend
python benchmark.py
```

The benchmark evaluates task-shaped records at:

```text
10
500
3000
```

Raw output is saved to:

```text
backend/results.txt
```

### Recorded Results

```text
TaskFlow Algorithm Benchmark Results
======================================================================

Input Size: 10
Insertion Sort Comparisons: 22
Binary Search Index: 5
Binary Search Comparisons: 5
Linear Search Index: -1
Linear Search Comparisons: 10

----------------------------------------------------------------------
Input Size: 500
Insertion Sort Comparisons: 42874
Binary Search Index: 250
Binary Search Comparisons: 15
Linear Search Index: -1
Linear Search Comparisons: 500

----------------------------------------------------------------------
Input Size: 3000
Insertion Sort Comparisons: 1492440
Binary Search Index: 1500
Binary Search Comparisons: 21
Linear Search Index: -1
Linear Search Comparisons: 3000

----------------------------------------------------------------------
```

These counts demonstrate the expected growth:

- Insertion sort: quadratic growth
- Binary search: logarithmic growth
- Linear search: linear growth

## Automated Algorithm Checks

Run:

```powershell
cd backend
python check_algorithms.py
```

Successful execution:

```text
All algorithm checks passed successfully.
```

The checks cover:

- Empty-list insertion sort
- Single-element insertion sort
- Binary search at first, middle, and last positions
- Binary-search not-found behavior
- Insertion-sort comparison counting
- Binary-search comparison counting
- Linear-search comparison counting

## Validation and Error Handling

The API uses Pydantic validation.

Expected status codes:

| Situation | Status |
|---|---:|
| Resource created | `201` |
| Successful read/update | `200` |
| Resource not found | `404` |
| Invalid request body | `422` |

Examples of invalid input include:

- Missing required fields
- Blank task titles
- Invalid priority values
- Non-existent project IDs
- Malformed Quick-Add requests

Invalid requests must not create invalid database rows.

## Database and ORM

SQLAlchemy manages the database session and ORM mappings.

Relationship model:

```text
User 1 ---- * Project
Project 1 ---- * Task
```

Task creation verifies that the referenced project exists before persistence.

Quick-Add uses the same database-session dependency and writes to the same task table as normal task creation.

## Middleware and CORS

The backend includes request middleware that logs:

```text
HTTP method
request path
processing time in milliseconds
```

CORS explicitly allows the frontend's local origin and configured HTTP methods/headers.

## Frontend Integration

The frontend uses the real backend through the Fetch API.

It:

- Loads tasks from the backend
- Renders task records into the DOM
- Adds tasks
- Edits tasks
- Deletes tasks
- Performs client-side validation
- Caches the task list in `localStorage`
- Restores cached data while live data is loading

User-provided values are rendered with DOM APIs such as `textContent` rather than unsafe HTML string concatenation.

## Testing Checklist

### Users

- Create
- List
- Get by ID
- Update
- Delete

### Projects

- Create
- List
- Get by ID
- Update
- Delete
- Statistics

### Tasks

- Create
- List
- Get by ID
- Update
- Delete
- Priority sorting
- Linear search
- Binary search
- Search by ID
- Quick-Add
- Low priority
- Medium/default priority
- High priority
- Date hints

### Algorithm Verification

```powershell
python check_algorithms.py
```

Result:

```text
All algorithm checks passed successfully.
```

### Benchmark Verification

```powershell
python benchmark.py
```

Results were generated for 10, 500, and 3000 task-shaped records and saved to `results.txt`.

## HTTP Status Summary

| Situation | HTTP Status |
|---|---:|
| Create success | 201 |
| Read/update success | 200 |
| Delete success | 200 |
| Resource not found | 404 |
| Request validation failure | 422 |

## Development Notes

The algorithm engine is part of the same backend that serves the CRUD endpoints. Sorting and searching operate on task records fetched from the database rather than on a disconnected demonstration module.

The Quick-Add parser also writes to the same task database used by normal CRUD operations. A task created through Quick-Add is therefore immediately available through the normal task list, search, sort, update, and delete functionality.

No paid external AI service is required for the required Quick-Add implementation.

## License

This repository was developed as an academic/project implementation of the TaskFlow specification.
