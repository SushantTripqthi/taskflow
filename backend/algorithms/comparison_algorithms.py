from algorithms.insertion_sort import PRIORITY_ORDER


def _get_comparable_value(record, key):
    """
    Convert a record value into a comparable value.

    Priority mapping required by the project:

        low    -> 1
        medium -> 2
        high   -> 3
    """

    value = record[key]

    if key == "priority":

        value = str(value).lower().strip()

        return PRIORITY_ORDER.get(value, 999)

    if isinstance(value, str):

        return value.lower().strip()

    return value


# ==================================================
# INSERTION SORT COUNT
# ==================================================

def insertion_sort_count(records, key):
    """
    Sort records in-place using Insertion Sort.

    Returns only the number of key comparisons.
    """

    comparison_count = 0

    for i in range(1, len(records)):

        current_record = records[i]

        current_value = _get_comparable_value(
            current_record,
            key
        )

        j = i - 1

        while j >= 0:

            previous_value = _get_comparable_value(
                records[j],
                key
            )

            # One actual key comparison.
            comparison_count += 1

            if previous_value > current_value:

                records[j + 1] = records[j]

                j -= 1

            else:

                break

        records[j + 1] = current_record

    return comparison_count


# ==================================================
# BINARY SEARCH COUNT
# ==================================================

def binary_search_count(
    sorted_records,
    target_value,
    key
):
    """
    Binary Search on an already sorted list.

    Returns exactly:

    {
        "index": int,
        "comparison_count": int
    }

    Not-found index is -1.
    """

    low = 0
    high = len(sorted_records) - 1

    comparison_count = 0

    target = target_value

    if isinstance(target, str):

        target = target.lower().strip()

    while low <= high:

        mid = (low + high) // 2

        middle_value = _get_comparable_value(
            sorted_records[mid],
            key
        )

        # One key comparison.
        comparison_count += 1

        if middle_value == target:

            return {
                "index": mid,
                "comparison_count": comparison_count
            }

        # One additional ordering comparison.
        comparison_count += 1

        if middle_value < target:

            low = mid + 1

        else:

            high = mid - 1

    return {
        "index": -1,
        "comparison_count": comparison_count
    }


# ==================================================
# LINEAR SEARCH COUNT
# ==================================================

def linear_search_count(
    records,
    target_value,
    key
):
    """
    Linear Search.

    Returns exactly:

    {
        "index": int,
        "comparison_count": int
    }

    Not-found index is -1.
    """

    target = target_value

    if isinstance(target, str):

        target = target.lower().strip()

    comparison_count = 0

    for index, record in enumerate(records):

        value = record[key]

        if isinstance(value, str):

            value = value.lower().strip()

        comparison_count += 1

        if value == target:

            return {
                "index": index,
                "comparison_count": comparison_count
            }

    return {
        "index": -1,
        "comparison_count": comparison_count
    }