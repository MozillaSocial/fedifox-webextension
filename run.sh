#!/bin/bash

$(npm bin)/web-ext run --verbose -f ./vendors/firefox/firefox --pref devtools.console.stdout.chrome=true --pref devtools.console.stdout.content=true --pref extensions.experiments.enabled=true
