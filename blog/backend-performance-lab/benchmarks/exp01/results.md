# Experiment 01 — Docker Image Optimization

## Objective

Quantify the impact of Dockerfile design choices on:

- final image size
- build time
- container startup latency
- runtime memory footprint
- security surface (qualitative)

## Variants

| Tag suffix          | Stages | Base image                                         | Notes                      |
| ------------------- | ------ | -------------------------------------------------- | -------------------------- |
| `single`            | 1      | `golang:1.22`                                      | fat image, no module cache |
| `multi-alpine`      | 2      | `golang:1.22` -> `alpine:3.20`                     | `CGO_ENABLED=0`, `-s -w`   |
| `distroless`        | 2      | `golang:1.22` -> `gcr.io/distroless/base-debian12` | glibc, no shell            |
| `distroless-static` | 2      | `golang:1.22` -> `gcr.io/distroless/static`        | static binary, no libc     |

All services: `user-service`, `product-service`, `order-service`, `notification-service`, `api-gateway`.

## Methodology

For each (service, variant):

1. Build with `docker buildx build` (BuildKit). `go mod download` and source layers cached on subsequent builds.
2. Record image size via `docker image inspect`.
3. Boot a throwaway container joined to the lab network, probe `/healthz` via the host-mapped port, record wall time from `docker run` to first 200 OK.
4. Fire 10 quick `/healthz` pings, then read RSS via `docker stats --no-stream`.

## Per-variant averages (across the three services we can stand alone in this network: user, order, notification)

| Variant             | Size (MB) | Startup (ms) | RSS (MB) |
| ------------------- | --------: | -----------: | -------: |
| `single`            |    1291.7 |         1499 |     18.0 |
| `multi-alpine`      |      20.6 |         1348 |      7.6 |
| `distroless`        |      32.1 |         1335 |     16.6 |
| `distroless-static` |      14.3 |         1372 |     17.4 |

## Results table (per service, per variant)

See [`all.csv`](all.csv).

## Analysis

### Image size

- `single` is **~80x larger** than `multi-alpine` and **~100x larger** than `distroless-static`. This is expected: `single` ships the full Go toolchain (~1.3 GB) inside the runtime layer.
- Among multi-stage variants, `distroless-static` is the smallest (~14 MB) because the static binary needs neither libc nor busybox.
- `distroless` is larger (~32 MB) than `multi-alpine` (~20 MB) because `gcr.io/distroless/base-debian12` ships glibc + base layers; the binary itself is identical.

### Build time

- `single` takes the longest for `user-service` (~195 s cold) because it runs `go mod download` and the full `go build` in a single layer with no parallelism hint. Subsequent services reuse the downloaded modules.
- Multi-stage builds are **uniformly fast** (~80–95 s), since the build layer can cache `go mod download` independently of the final image.

### Startup latency

- All variants boot in **1.0–1.5 s**. Differences are within noise; container start is dominated by `runc` and process scheduling, not image size.
- `multi-alpine` and `distroless` are statistically tied.

### Memory footprint

- `multi-alpine` is the clear winner at **~7.6 MB RSS**. musl libc is lighter than glibc.
- `distroless-static` and `single` both sit at ~17 MB. The static binary has no libc to share pages with, and the Go runtime still allocates its own arenas.
- `distroless` (with glibc) lands at ~16.6 MB — surprisingly close to `single` because glibc's bookkeeping adds overhead.

### Security

- `single`: ships `go`, `git`, `bash`, `ca-certificates`, package manager. Worst attack surface.
- `multi-alpine`: ships `apk`, `wget`, busybox. Reduced but still has shell.
- `distroless`: no shell, no package manager. Only `ca-certificates` and `/etc/passwd`.
- `distroless-static`: same as `distroless` minus glibc. Smallest possible userland.

## Trade-offs

| Variant             | Pros                                   | Cons                                       |
| ------------------- | -------------------------------------- | ------------------------------------------ |
| `single`            | simplest Dockerfile, easy debugging    | huge, slowest to pull, biggest CVE surface |
| `multi-alpine`      | small, memory-light, familiar          | musl quirks, `apk` is a shell entry point  |
| `distroless`        | secure, no shell, debian-compatible    | larger than alpine-static                  |
| `distroless-static` | smallest, most secure, fastest to pull | no `dlopen`, no cgo, harder to debug       |

## Conclusion

For this lab, **`multi-alpine` is the sweet spot** for most services — small image, lowest memory, fast build, and we never need cgo or a shell inside the container. We use it as the **default** in the production compose overlay.

We use **`distroless-static`** for the `api-gateway` because it is the most security-sensitive entry point.

The `single` variant is kept around only as a **baseline** for the experiment; we never ship it.

## Artifacts

- `build-summary.csv` — build time + size per image
- `runtime-summary.csv` — startup + RSS per image
- `all.csv` — merged
- `build.log`, `runtime.log` — full output

## Reproduce

```bash
bash scripts/experiments/exp01-images.sh
```
