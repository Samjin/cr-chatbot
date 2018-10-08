<template>
  <v-app id="lex-web"
  >
    <toolbar-container
      v-bind:toolbar-title="toolbarTitle"
      v-bind:toolbar-color="toolbarColor"
      v-bind:toolbar-logo="toolbarLogo"
      v-bind:is-ui-minimized="isUiMinimized"
      v-on:toggleMinimizeUi="toggleMinimizeUi"
    ></toolbar-container>

    <v-content>
      <v-container class="message-list-container" fluid pa-0>
        <message-list v-show="!isUiMinimized"
        ></message-list>
      </v-container>
    </v-content>

    <input-container
      v-if="!isUiMinimized"
      v-bind:text-input-placeholder="textInputPlaceholder"
      v-bind:initial-speech-instruction="initialSpeechInstruction"
    ></input-container>
  </v-app>
</template>

<script>
/*
Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
import ToolbarContainer from '@/components/ToolbarContainer';
import MessageList from '@/components/MessageList';
import InputContainer from '@/components/InputContainer';

export default {
  name: 'lex-web',
  components: {
    ToolbarContainer,
    MessageList,
    InputContainer,
  },
  data() {
    return {
      userIsLeaving: false,
      transcripts: [],
    };
  },
  computed: {
    initialSpeechInstruction() {
      return this.$store.state.config.lex.initialSpeechInstruction;
    },
    textInputPlaceholder() {
      return this.$store.state.config.ui.textInputPlaceholder;
    },
    toolbarColor() {
      return this.$store.state.config.ui.toolbarColor;
    },
    toolbarTitle() {
      return this.$store.state.config.ui.toolbarTitle;
    },
    toolbarLogo() {
      return this.$store.state.config.ui.toolbarLogo;
    },
    isUiMinimized() {
      return this.$store.state.isUiMinimized;
    },
    lexState() {
      return this.$store.state.lex;
    },
    isMobile() {
      const mobileResolution = 900;
      return (this.$vuetify.breakpoint.smAndDown &&
        'navigator' in window && navigator.maxTouchPoints > 0 &&
        'screen' in window &&
        (window.screen.height < mobileResolution ||
          window.screen.width < mobileResolution)
      );
    },
  },
  watch: {
    // emit lex state on changes
    lexState() {
      this.$emit('updateLexState', this.lexState);
    },
    userIsLeaving() {
      this.saveTranscripts();
    },
  },
  created() {
    // override default vuetify vertical overflow on non-mobile devices
    // hide vertical scrollbars
    if (!this.isMobile) {
      document.documentElement.style.overflowY = 'hidden';
    }

    this.initConfig()
      .then(() => Promise.all([
        this.$store.dispatch(
          'initCredentials',
          this.$lexWebUi.awsConfig.credentials,
        ),
        this.$store.dispatch('initRecorder'),
        this.$store.dispatch(
          'initBotAudio',
          (window.Audio) ? new Audio() : null,
        ),
      ]))
      .then(() => Promise.all([
        this.$store.dispatch('initMessageList'),
        this.$store.dispatch('initPollyClient', this.$lexWebUi.pollyClient),
        this.$store.dispatch('initLexClient', this.$lexWebUi.lexRuntimeClient),
      ]))
      .then(() => (
        (this.$store.state.isRunningEmbedded) ?
          this.$store.dispatch(
            'sendMessageToParentWindow',
            { event: 'ready' },
          ) :
          Promise.resolve()
      ))
      .then(() => console.info(
        'sucessfully initialized lex web ui version: ',
        this.$store.state.version,
      ))
      .catch((error) => {
        console.error('could not initialize application while mounting:', error);
      });
  },
  methods: {
    toggleMinimizeUi() {
      return this.$store.dispatch('toggleIsUiMinimized');
    },
    // messages from parent
    messageHandler(evt) {
      // security check
      if (evt.origin !== this.$store.state.config.ui.parentOrigin) {
        console.warn('ignoring event - invalid origin:', evt.origin);
        return;
      }
      if (!evt.ports || !Array.isArray(evt.ports) || !evt.ports.length) {
        console.warn('postMessage not sent over MessageChannel', evt);
        return;
      }
      switch (evt.data.event) {
        case 'ping':
          console.info('pong - ping received from parent');
          evt.ports[0].postMessage({ event: 'resolve', type: evt.data.event });
          break;
        // received when the parent page has loaded the iframe
        case 'parentReady':
          evt.ports[0].postMessage({ event: 'resolve', type: evt.data.event });
          break;
        // received when user is leaving or refresh the site
        case 'sendEmailNotifier':
          this.userIsLeaving = true;
          evt.ports[0].postMessage({ event: 'resolve', type: evt.data.event });
          break;
        case 'toggleMinimizeUi':
          this.$store.dispatch('toggleIsUiMinimized')
            .then(() => {
              evt.ports[0].postMessage({
                event: 'resolve',
                type: evt.data.event,
              })
            });
        break;
        case 'postText':
          if (!evt.data.message) {
            evt.ports[0].postMessage({
              event: 'reject',
              type: evt.data.event,
              error: 'missing message field',
            });
            return;
          }

          this.$store.dispatch(
            'postTextMessage',
            { type: 'human', text: evt.data.message },
          )
            .then(() => evt.ports[0].postMessage({
              event: 'resolve', type: evt.data.event,
            }));
          break;
        default:
          console.warn('unknown message in messageHanlder', evt);
          break;
      }
    },
    logRunningMode() {
      if (!this.$store.state.isRunningEmbedded) {
        console.info('running in standalone mode');
        return;
      }

      console.info(
        'running in embedded mode from URL: ',
        document.location.href,
      );
      console.info('referrer (possible parent) URL: ', document.referrer);
      console.info(
        'config parentOrigin:',
        this.$store.state.config.ui.parentOrigin,
      );
      if (!document.referrer
        .startsWith(this.$store.state.config.ui.parentOrigin)
      ) {
        console.warn(
          'referrer origin: [%s] does not match configured parent origin: [%s]',
          document.referrer, this.$store.state.config.ui.parentOrigin,
        );
      }
    },
    initConfig() {
      if (this.$store.state.config.urlQueryParams.lexWebUiEmbed !== 'true') {
        this.$store.commit('setIsRunningEmbedded', false);
        this.$store.commit('setAwsCredsProvider', 'cognito');
      } else {
        window.addEventListener('message', this.messageHandler, false);
        this.$store.commit('setIsRunningEmbedded', true);
        this.$store.commit('setAwsCredsProvider', 'parentWindow');
      }

      // get config
      return this.$store.dispatch('initConfig', this.$lexWebUi.config)
        .then(() => this.$store.dispatch('getConfigFromParent'))
        // avoid merging an empty config
        .then(config => (
          (Object.keys(config).length) ?
            this.$store.dispatch('initConfig', config) : Promise.resolve()
        ))
        .then(() => this.logRunningMode());
    },
    saveTranscripts() {
      // Don't save messages if user haven't ask any question
      if (this.$store.state.messages.length > 1) {
        this.$store.state.messages.forEach((message, i) => {
          if (i === 0) {
            this.transcripts.push(
              `date: ${message.date}`,
              `Bot initial question: ${message.text}`,
              )
          } else {
            let messageType = message.type === 'bot' ? 'Bot' : 'User';
            this.transcripts.push(`${messageType}: ${message.text}`);
          }
        });
        this.mutateTranscript();
        this.sendEmail();
      }
    },
    mutateTranscript() {
      // Insert booking number to index 1
      let bookingQuestion = "Bot: What's your booking number? ";
      let lastIndexNum = this.transcripts.lastIndexOf(bookingQuestion);
      if (lastIndexNum > -1) {
        for (let i = 0; i < this.transcripts.length; i++) {
          if (this.transcripts[lastIndexNum + 1].length > 0) {
            this.transcripts.splice(1, 0, `Booking-number: ${this.transcripts[lastIndexNum + 1].replace('User: ', '')}`);
            break;
          }
        }
      }
    },
    sendEmail() {
      console.info(this.transcripts);
      let xhr = new XMLHttpRequest();
      // Use sync post so chrome can process the ajax before session is closed
      xhr.open('POST', 'https://wc4p5hrrp2.execute-api.us-east-1.amazonaws.com/cr-chatbot-prod', false);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.onload = () => {
        console.info(this.responseText);
      };
      xhr.send(JSON.stringify(this.transcripts));
    },

  },
};
</script>

<style>
.message-list-container {
  /* vuetify toolbar and footer are 48px each when using 'dense' */
  height: calc(100% - 96px);
  position: fixed;
  top: 48px;
}
</style>
