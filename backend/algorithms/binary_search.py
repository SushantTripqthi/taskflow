def binary_search(
    sorted_records,
    target_value,
    key,
    counter=None
):
    """
    Binary Search.

    The input records must already be sorted
    according to the provided key.

    Returns:
        Index of matching record.
        Returns -1 if the record is not found.
    """

    low = 0
    high = len(sorted_records) - 1

    target = target_value

    if isinstance(target, str):
        target = target.lower().strip()

    while low <= high:

        mid = (low + high) // 2

        middle_value = sorted_records[mid][key]

        # Handle Enum values
        if hasattr(middle_value, "value"):
            middle_value = middle_value.value

        # Normalize strings
        if isinstance(middle_value, str):
            middle_value = middle_value.lower().strip()

        # Equality comparison
        if counter is not None:
            counter.increment()

        if middle_value == target:
            return mid

        # Ordering comparison
        if counter is not None:
            counter.increment()

        if middle_value < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1