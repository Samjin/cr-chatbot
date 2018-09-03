# This environment file is sourced from the Makefiles in this project
# it is in Makefile format (not shell)

# bucket name and prefix path used to store templates, data, scripts and
# build artifacts
# NOTE: S3 path should match the BootstrapBucket and BootstrapPrefix parameters
# in master.yaml template
export BOOTSTRAP_BUCKET_PATH ?= aws-bigdata-blog/artifacts/aws-lex-web-ui/artifacts

# S3 bucket hosting the web application
# The Makefile in the root dir can sync the local files to it
export WEBAPP_BUCKET ?= cr-chatbot-codebuilddeploy-17o0gzebg-webappbucket-cu246regyepf

# AWS cli env variables used when running/building
# Override by setting it in the environment before running make
export AWS_DEFAULT_PROFILE ?= default
export AWS_DEFAULT_REGION ?= us-east-1

# lex-web-ui config variables
export BOT_NAME ?= CR_chatbot
# set to empty if not present in environment
export POOL_ID ?= us-east-1:7bd01f8a-a4c8-400c-9787-56f6a9b96bc3

export BOT_INITIAL_TEXT ?= $()
export BOT_INITIAL_SPEECH ?= $()
export UI_TOOLBAR_TITLE ?= $()
export UI_TOOLBAR_LOGO ?= $()

export IFRAME_ORIGIN ?= $()
export PARENT_ORIGIN ?= $()
