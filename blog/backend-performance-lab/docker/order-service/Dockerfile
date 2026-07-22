# Stage 2 placeholder Dockerfile (single-stage).
# Stage 3 will replace this with multi-stage / distroless variants for the image-size experiment.
FROM golang:1.22-alpine

WORKDIR /src

# Cache dependencies first
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest
COPY pkg/      ./pkg/
COPY services/ ./services/

ENV CGO_ENABLED=0 GOOS=linux

ARG SERVICE
RUN go build -trimpath -ldflags="-s -w" -o /out/app ./services/${SERVICE}

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
COPY --from=0 /out/app /app
EXPOSE 8080
ENTRYPOINT ["/app"]
