"""Vercel Python Function entrypoint for the Falcon Newsroom API."""

from server.auth_app import app


__all__ = ["app"]
