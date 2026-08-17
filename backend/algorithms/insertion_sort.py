# ==================================================
# PRIORITY ORDER
# ==================================================

PRIORITY_ORDER = {
    "low": 1,
    "medium": 2,
    "high": 3
}


# ==================================================
# NORMALIZE VALUE
# ==================================================

def _normalize_value(value):
    """
    Normalize values before comparison.
    """

    # Handle Enum values
    if hasattr(value, "value"):
        value = value.value

    # Handle strings
    if isinstance(value, str):
        return value.lower().strip()

    return value


# ==================================================
# INSERTION SORT
# ==================================================

def insertion_sort(
    records,
    key,
    counter=None
):
    """
    Custom Insertion Sort.

    Sorts records in ascending order based
    on the supplied dictionary key.

    Parameters:
        records: list of dictionaries
        key: dictionary field used for sorting
        counter: optional ComparisonCounter

    Returns:
        Sorted list
    """

    for i in range(1, len(records)):

        current = records[i]

        current_value = _normalize_value(
            current[key]
        )

        # --------------------------------------------------
        # Priority custom ordering
        # low < medium < high
        # --------------------------------------------------

        if key == "priority":

            current_value = PRIORITY_ORDER.get(
                current_value,
                999
            )

        j = i - 1

        while j >= 0:

            previous_value = _normalize_value(
                records[j][key]
            )

            if key == "priority":

                previous_value = PRIORITY_ORDER.get(
                    previous_value,
                    999
                )

            # --------------------------------------------------
            # Count comparison
            # --------------------------------------------------

            if counter is not None:
                counter.increment()

            # --------------------------------------------------
            # Stop if previous value is already <= current
            # --------------------------------------------------

            if previous_value <= current_value:
                break

            # --------------------------------------------------
            # Shift record
            # --------------------------------------------------

            records[j + 1] = records[j]

            j -= 1

        # --------------------------------------------------
        # Insert current record
        # --------------------------------------------------

        records[j + 1] = current

    return records