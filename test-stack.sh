#!/bin/bash

echo "Testing Frontend..."
curl -f http://localhost:8080 || exit 1

echo "Testing Backend..."
curl -f http://localhost:8081/api/health || exit 1

echo "Testing Frontend-Backend Communication..."
curl -f http://localhost:8080/api/ || exit 1

echo "All tests passed!"
