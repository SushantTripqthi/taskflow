def linear_search(
    records,
    target_value,
    key,
    counter=None
):
    """
    Linear Search.

    Returns:
        Index of the first matching record.
        Returns -1 if not found.
    """

    target = target_value

    if isinstance(target, str):
        target = target.lower().strip()

    for index in range(len(records)):

        value = records[index][key]

        # Handle Enum values
        if hasattr(value, "value"):
            value = value.value

        # Normalize strings
        if isinstance(value, str):
            value = value.lower().strip()

        # Count comparison
        if counter is not None:
            counter.increment()

        if value == target:
            return index

    return -1