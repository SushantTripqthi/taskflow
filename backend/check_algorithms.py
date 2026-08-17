from algorithms.insertion_sort import insertion_sort
from algorithms.linear_search import linear_search
from algorithms.binary_search import binary_search
from algorithms.comparison_counter import ComparisonCounter


def test_insertion_sort():

    records = [
        {"id": 3, "title": "Charlie"},
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"}
    ]

    counter = ComparisonCounter()

    result = insertion_sort(
        records,
        "id",
        counter
    )

    assert [item["id"] for item in result] == [
        1,
        2,
        3
    ]

    assert counter.get_count() > 0


def test_linear_search():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"}
    ]

    counter = ComparisonCounter()

    index = linear_search(
        records,
        "Bravo",
        "title",
        counter
    )

    assert index == 1

    assert counter.get_count() == 2


def test_binary_search():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"},
        {"id": 4, "title": "Delta"}
    ]

    counter = ComparisonCounter()

    index = binary_search(
        records,
        "Charlie",
        "title",
        counter
    )

    assert index == 2

    assert counter.get_count() > 0


def test_linear_search_not_found():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"}
    ]

    counter = ComparisonCounter()

    index = linear_search(
        records,
        "XYZ",
        "title",
        counter
    )

    assert index == -1


def test_binary_search_not_found():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"}
    ]

    counter = ComparisonCounter()

    index = binary_search(
        records,
        "XYZ",
        "title",
        counter
    )

    assert index == -1


if __name__ == "__main__":

    test_insertion_sort()
    test_linear_search()
    test_binary_search()
    test_linear_search_not_found()
    test_binary_search_not_found()

    print(
        "All algorithm checks passed successfully."
    )