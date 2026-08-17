import random

from algorithms.comparison_algorithms import (
    insertion_sort_count,
    binary_search_count,
    linear_search_count
)


# ==================================================
# DATA GENERATION
# ==================================================

def generate_task_records(size):
    """
    Generate synthetic task dictionaries using the same
    fields operated on by the TaskFlow task endpoints.

    Fields:
        id
        title
        priority
        due_date
    """

    random_generator = random.Random(42)

    priorities = [
        "low",
        "medium",
        "high"
    ]

    records = []

    for i in range(1, size + 1):

        priority = random_generator.choice(
            priorities
        )

        records.append(
            {
                "id": i,
                "title": f"Task {i:05d}",
                "priority": priority,
                "due_date": f"2026-12-{(i % 28) + 1:02d}"
            }
        )

    # Shuffle the records so insertion sort has
    # meaningful work to perform.

    random_generator.shuffle(records)

    return records


# ==================================================
# SINGLE BENCHMARK
# ==================================================

def benchmark_size(size):

    original_records = generate_task_records(size)

    # ----------------------------------------------
    # Insertion Sort Count
    # ----------------------------------------------

    insertion_records = [
        record.copy()
        for record in original_records
    ]

    insertion_comparisons = insertion_sort_count(
        insertion_records,
        "priority"
    )

    # ----------------------------------------------
    # Binary Search Count
    # ----------------------------------------------

    binary_records = [
        record.copy()
        for record in original_records
    ]

    # Binary search requires sorted data.
    # We use the same custom insertion-sort engine
    # before running the counted binary search.

    insertion_sort_count(
        binary_records,
        "title"
    )

    binary_target = binary_records[
        size // 2
    ]["title"]

    binary_result = binary_search_count(
        binary_records,
        binary_target,
        "title"
    )

    # ----------------------------------------------
    # Linear Search Count
    # ----------------------------------------------

    linear_target = (
        "__TASK_THAT_DOES_NOT_EXIST__"
    )

    linear_result = linear_search_count(
        original_records,
        linear_target,
        "title"
    )

    return {
        "size": size,

        "insertion_sort_comparisons":
            insertion_comparisons,

        "binary_search_index":
            binary_result["index"],

        "binary_search_comparisons":
            binary_result["comparison_count"],

        "linear_search_index":
            linear_result["index"],

        "linear_search_comparisons":
            linear_result["comparison_count"]
    }


# ==================================================
# RUN BENCHMARK
# ==================================================

def run_benchmark():

    sizes = [
        10,
        500,
        3000
    ]

    results = []

    for size in sizes:

        result = benchmark_size(size)

        results.append(result)

    return results


# ==================================================
# SAVE RESULTS
# ==================================================

def save_results(
    results,
    filename="results.txt"
):

    with open(
        filename,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(
            "TaskFlow Algorithm Benchmark Results\n"
        )

        file.write(
            "=" * 70 + "\n\n"
        )

        for result in results:

            file.write(
                f"Input Size: {result['size']}\n"
            )

            file.write(
                "Insertion Sort Comparisons: "
                f"{result['insertion_sort_comparisons']}\n"
            )

            file.write(
                "Binary Search Index: "
                f"{result['binary_search_index']}\n"
            )

            file.write(
                "Binary Search Comparisons: "
                f"{result['binary_search_comparisons']}\n"
            )

            file.write(
                "Linear Search Index: "
                f"{result['linear_search_index']}\n"
            )

            file.write(
                "Linear Search Comparisons: "
                f"{result['linear_search_comparisons']}\n"
            )

            file.write(
                "-" * 70 + "\n"
            )


# ==================================================
# MAIN
# ==================================================

if __name__ == "__main__":

    results = run_benchmark()

    save_results(results)

    print()
    print(
        "TaskFlow Algorithm Benchmark"
    )
    print("=" * 70)

    for result in results:

        print(
            f"Size: {result['size']}"
        )

        print(
            "Insertion Sort comparisons: "
            f"{result['insertion_sort_comparisons']}"
        )

        print(
            "Binary Search comparisons: "
            f"{result['binary_search_comparisons']}"
        )

        print(
            "Linear Search comparisons: "
            f"{result['linear_search_comparisons']}"
        )

        print("-" * 70)

    print(
        "Raw results saved to results.txt"
    )