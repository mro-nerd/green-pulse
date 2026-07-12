"""
Prisma async client singleton.
Call `connect_db()` on startup and `disconnect_db()` on shutdown.
"""
from prisma import Prisma

_client: Prisma | None = None


def get_client() -> Prisma:
    if _client is None:
        raise RuntimeError("Prisma client not initialised — call connect_db() first.")
    return _client


async def connect_db() -> None:
    global _client
    _client = Prisma()
    await _client.connect()


async def disconnect_db() -> None:
    global _client
    if _client is not None:
        await _client.disconnect()
        _client = None
