import time


async def request_logging_middleware(request, call_next):

    start_time = time.perf_counter()

    response = await call_next(request)

    end_time = time.perf_counter()

    processing_time_ms = (
        end_time - start_time
    ) * 1000

    print(
        f"{request.method} "
        f"{request.url.path} "
        f"{processing_time_ms:.2f} ms"
    )

    return response