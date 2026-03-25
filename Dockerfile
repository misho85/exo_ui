ARG ELIXIR_VERSION=1.19.5
ARG OTP_VERSION=28.4.1
ARG UBUNTU_VERSION=noble-20260217

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-ubuntu-${UBUNTU_VERSION}"
ARG RUNNER_IMAGE="ubuntu:${UBUNTU_VERSION}"

FROM ${BUILDER_IMAGE} AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

ENV MIX_ENV="prod"

# Copy root exo_ui source (path dependency used by storybook)
COPY mix.exs mix.lock ./
COPY lib ./lib
COPY assets ./assets
COPY priv ./priv

# Copy storybook mix files and fetch deps
COPY storybook/mix.exs storybook/mix.lock ./storybook/
WORKDIR /app/storybook
RUN mix deps.get --only $MIX_ENV

# Copy compile-time config and compile deps
RUN mkdir -p config
COPY storybook/config/config.exs storybook/config/prod.exs config/
RUN mix deps.compile

# Install esbuild and build JS assets
RUN mix esbuild.install --if-missing
COPY storybook/assets ./assets
RUN mkdir -p priv/static/assets
RUN mix esbuild storybook

# Copy source and compile
COPY storybook/lib ./lib
COPY storybook/stories ./stories
RUN mix compile

# Copy runtime config and build release
COPY storybook/config/runtime.exs config/
RUN mix release

# --- Runner stage ---
FROM ${RUNNER_IMAGE} AS final

RUN apt-get update \
  && apt-get install -y --no-install-recommends libstdc++6 openssl libncurses6 locales ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

WORKDIR /app
RUN chown nobody /app

ENV MIX_ENV="prod"

COPY --from=builder --chown=nobody:root /app/storybook/_build/${MIX_ENV}/rel/exo_ui_storybook ./

USER nobody

CMD ["/app/bin/exo_ui_storybook", "start"]
