#!/bin/sh

set -ex
yarn prisma migrate deploy
yarn start
