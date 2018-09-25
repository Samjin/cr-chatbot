#  This Makefile is used to update the bootstrap bucket containing
#  the project source and CloudFormation templates

# environment file controls config parameters
CONFIG_ENV := ../config/env.mk
include $(CONFIG_ENV)

# cfn templates
TEMPLATES_DIR := ../templates
TEMPLATES := $(wildcard $(TEMPLATES_DIR)/*.yaml)

# build output directory
OUT := out
# put output dir in VPATH to simplify finding dependencies
VPATH := $(OUT)

.DELETE_ON_ERROR:

# upload files to bootstrap bucket
# NOTE: files uploaded with public read permissions
upload: upload-templates upload-custom-resources-zip upload-src-zip \
	upload-response-card-image upload-send-email-zip upload-cross-border-fees-zip
.PHONY: upload

# create the output directory for tracking dependencies
$(OUT):
	mkdir -p "$(@)"

# upload cfn templatess
upload-templates: $(TEMPLATES) | $(OUT)
	@echo "[INFO] Validating templates"
	@$(MAKE) -C $(TEMPLATES_DIR)
	@echo "[INFO] Uploading templates"
	aws s3 sync --acl public-read --exclude "*" --include "*.yaml" \
		"$(TEMPLATES_DIR)" "s3://$(BOOTSTRAP_BUCKET_PATH)/templates/" \
		| tee "$(OUT)/$(@)"
	@echo "[INFO] master template: https://s3.amazonaws.com/$(BOOTSTRAP_BUCKET_PATH)/templates/master.yaml"

# cfn custom resource lambda files are found under this directory
CUSTOM_RESOURCES_DIR := $(TEMPLATES_DIR)/custom-resources

# zip cfn custom resource lambda files
# BOT_DEFINITION_FILE := $(CUSTOM_RESOURCES_DIR)/bot-definition.json
CUSTOM_RESOURCES_ZIP := custom-resources.zip
CUSTOM_RESOURCES_FILES := $(wildcard $(CUSTOM_RESOURCES_DIR)/*.py)
CUSTOM_RESOURCES_FILES += $(wildcard $(CUSTOM_RESOURCES_DIR)/*.js)
CUSTOM_RESOURCES_FILES += $(wildcard $(CUSTOM_RESOURCES_DIR)/*.json)
# CUSTOM_RESOURCES_FILES += $(BOT_DEFINITION_FILE)
$(CUSTOM_RESOURCES_ZIP): $(CUSTOM_RESOURCES_FILES) | $(OUT)
	@echo "[INFO] Creating custom resource Lambda zip file"
	zip -u -j "$(OUT)/$(@)" $(?)

upload-custom-resources-zip: $(CUSTOM_RESOURCES_ZIP) | $(OUT)
	@echo "[INFO] Uploading custom resources Lambda zip file"
	aws s3 cp --acl public-read \
		"$(OUT)/$(CUSTOM_RESOURCES_ZIP)" \
		"s3://$(BOOTSTRAP_BUCKET_PATH)/$(CUSTOM_RESOURCES_ZIP)" \
		| tee -a "$(OUT)/$(@)"

# files in this repo are bundled in a zip file to boostrap the codecommit repo
SRC_ZIP := src.zip
SRC_FILES := $(shell git ls-files ..)
$(SRC_ZIP): $(SRC_FILES) | $(OUT)
	@echo "[INFO] creating git repo archive"
	cd .. && git archive --format=zip HEAD > "build/$(OUT)/$(@)"

upload-src-zip: $(SRC_ZIP) | $(OUT)
	@echo "[INFO] uploading git repo archive"
	aws s3 cp --acl public-read \
		"$(OUT)/$(SRC_ZIP)" "s3://$(BOOTSTRAP_BUCKET_PATH)/src.zip" \
		| tee -a "$(OUT)/$(@)"

RESPONSE_CARD_IMAGE := ../lex-web-ui/static/img/flowers.jpeg
upload-response-card-image: $(RESPONSE_CARD_IMAGE) | $(OUT)
	@echo "[INFO] uploading response card image"
	aws s3 cp --acl public-read --content-type 'image/jpg' \
		"$(RESPONSE_CARD_IMAGE)" "s3://$(BOOTSTRAP_BUCKET_PATH)/flowers.jpeg" \
		| tee -a "$(OUT)/$(@)"

# CUSTOM zip files: zip lambda folder content
# update zip file recursively to zip_directory with all files and folder
CROSS_BORDER_FEES_DIR := ../lambda/cross-border-fees
CROSS_BORDER_FEES_ZIP_DIR := ../../build/$(OUT)
CROSS_BORDER_FEES_ZIP := cross-border-fees.zip
CROSS_BORDER_FEES_CONTENT := *
cross-border-fees.zip: $(CROSS_BORDER_FEES_CONTENT) | $(OUT)
	@echo "[INFO] Creating cross border fees.zip file"
	cd $(CROSS_BORDER_FEES_DIR); zip -u -r $(CROSS_BORDER_FEES_ZIP_DIR)/$(@) $(CROSS_BORDER_FEES_CONTENT)

upload-cross-border-fees-zip: $(CROSS_BORDER_FEES_ZIP) | $(OUT)
	@echo "[INFO] Uploading cross-border-fees.zip to S3 and update Lambda"
	aws s3 cp --acl public-read \
		"$(OUT)/$(CROSS_BORDER_FEES_ZIP)" \
		"s3://$(BOOTSTRAP_BUCKET_PATH)/$(CROSS_BORDER_FEES_ZIP)" \
		| tee -a "$(OUT)/$(@)"
	aws lambda update-function-code \
	--function-name "cross-border-fees" \
	--zip-file "fileb://./out/cross-border-fees.zip" \
	--region "us-east-1"

SEND_EMAIL_DIR := ../lambda/send-email
SEND_EMAIL_ZIP_DIR := ../../build/$(OUT)
SEND_EMAIL_ZIP := send-email.zip
SEND_EMAIL_CONTENT := *
send-email.zip: $(SEND_EMAIL_CONTENT) | $(OUT)
	@echo "[INFO] Creating send-email.zip"
	cd $(SEND_EMAIL_DIR); \
	zip -u -r $(SEND_EMAIL_ZIP_DIR)/$(@) $(SEND_EMAIL_CONTENT)

upload-send-email-zip: $(SEND_EMAIL_ZIP) | $(OUT)
	@echo "[INFO] Uploading send-email.zip to S3 and update Lambda"
	aws s3 cp --acl public-read \
		"$(OUT)/$(SEND_EMAIL_ZIP)" \
		"s3://$(BOOTSTRAP_BUCKET_PATH)/$(SEND_EMAIL_ZIP)" \
		| tee -a "$(OUT)/$(@)"
	aws lambda update-function-code \
	--function-name "send-email" \
	--zip-file "fileb://./out/send-email.zip" \
	--region "us-east-1"


clean:
	-rm -rf $(OUT)/*
.PHONY: clean
