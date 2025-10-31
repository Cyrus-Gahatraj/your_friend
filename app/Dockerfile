FROM astral/uv:python3.12-bookworm-slim 
WORKDIR /app 
COPY pyproject.toml uv.lock ./ 
RUN uv sync 
COPY . . 
COPY personas ./personas
EXPOSE 8000 
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]