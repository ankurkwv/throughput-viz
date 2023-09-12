  let queueMessageProgresses = [];
  let currentQueueMessageCounts = [];
  let messageIds = [];
  let timeoutIds = [];
  let playButton = document.querySelector("#play");
  const urlParams = new URLSearchParams(window.location.search);
  const autoplay = urlParams.get('autoplay');

  let titles = [
      { 
          "borderId": "path-1",
          "title": "YOUR PARENT ACCOUNT",
      },
      { 
          "borderId": "path-3",
          "title": "Sender Queue 23211",
          "subtitle": "75 MPS"
      },,
      { 
          "borderId": "path-5",
          "title": "Sender Queue 55222",
          "subtitle": "75 MPS"
      },
      { 
          "borderId": "path-7",
          "title": "Sender Queue 78787",
          "subtitle": "75 MPS"
      },,
      { 
          "borderId": "path-9",
          "title": "Account Based Rate Limit",
          "subtitle": "75 MPS"
      },
  ];
  let POSITIONS;

  let ANIMATION_ORDERS = [
      {queueId: 'queue-1', startDelay: 0, messageSpacing: 10, messageCount: 30},
      {queueId: 'queue-2', startDelay: 0, messageSpacing: 100, messageCount: 20},
      {queueId: 'queue-1', startDelay: 2000, messageSpacing: 100, messageCount: 10},
      {queueId: 'queue-3', startDelay: 1500, messageSpacing: 10, messageCount: 100},
  ];

  const QUEUE_CONFIGS = [
      {queueId: 'queue-4', duration: 250},
      {queueId: 'queue-1', duration: 250},
      {queueId: 'queue-2', duration: 250},
      {queueId: 'queue-3', duration: 250},
  ];

  const addTitles = () => {
    titles.forEach(({borderId, title, subtitle}) => {
      const borderElement = document.querySelector(`#${borderId}`);

      if(!borderElement) {
        return;
      }

      const bbox = getAugmentedBbox(borderElement, true);
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'svg-title';
      titleDiv.innerText = title;
      titleDiv.style.left = `${bbox.x + 6}px`;
      titleDiv.style.top = `${bbox.y - 10}px`;

      document.body.appendChild(titleDiv);

      if (subtitle) {
        const subtitleDiv = document.createElement('div');
        subtitleDiv.className = 'svg-subtitle';
        subtitleDiv.innerText = subtitle;
        subtitleDiv.style.right = `${bbox.xRight}px`;
        document.body.appendChild(subtitleDiv);
        subtitleDiv.style.top = `${bbox.yBottom - subtitleDiv.offsetHeight}px`;
      }

    });
  }

  const resetAnimations = () => {
    // Step 1: Clear all timeouts
    timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutIds = [];

    // Step 2: Reset state variables
    queueMessageProgresses = [];
    currentQueueMessageCounts = [];
    messageIds = [];

    // Step 3: Remove dynamically created elements
    const svg = document.querySelector("svg");
    anime.remove('.message-clone');
    svg.querySelectorAll(".message-clone").forEach(el => el.remove());

    // Step 4: Restart animations from the beginning
    // (You might want to put the initialization code in a separate function so you can call it here)
    initializeAnimations();
  };

  const initializeAnimations = () => {
    playButton.innerText = 'Restart'
    const svg = document.querySelector("svg");
      const icon_message_el = document.querySelector('#message');
      icon_message_el.style.display = "none";

      const appBbox = getAugmentedBbox(document.querySelector('#app'));
      const twloBbox = getAugmentedBbox(document.querySelector('#twlo'));
      const phoneBbox = getAugmentedBbox(document.querySelector('#phone'));

      const messageHeight = getAugmentedBbox(icon_message_el).height;

      POSITIONS = {
          APP: { 
              x: appBbox.x + 10, 
              y: appBbox.y + appBbox.height / 2 - messageHeight / 2
          },
          TWLO: { 
              x: twloBbox.x + 10, 
              y: twloBbox.y + twloBbox.height / 2 - messageHeight / 2
          },
          PHONE: { 
              x: phoneBbox.x + 10, 
              y: phoneBbox.y + phoneBbox.height / 2 - messageHeight / 2
          }
      };
      
      QUEUE_CONFIGS.forEach(config => {
          const queueBbox = getAugmentedBbox(document.querySelector(`#${config.queueId}`));
          
          POSITIONS[config.queueId.toUpperCase() + '_START'] = {
              x: queueBbox.x,
              y: queueBbox.y + queueBbox.height / 2 - messageHeight / 2
          };
          
          POSITIONS[config.queueId.toUpperCase() + '_END'] = {
              x: queueBbox.x + queueBbox.width - 10,
              y: queueBbox.y + queueBbox.height / 2 - messageHeight / 2
          };

          queueMessageProgresses[config.queueId] = [];
          currentQueueMessageCounts[config.queueId] = 0;
          messageIds[config.queueId] = 0;
      });

    const dequeueMessage = (msg) => {
      anime({
          targets: msg,
          keyframes: [
            { translateX: POSITIONS.PHONE.x, translateY: POSITIONS.PHONE.y, duration: 500
            },
            { translateX: POSITIONS.PHONE.x, translateY: POSITIONS.PHONE.y, duration: 50, scale: 0 },
        ],
        easing: "linear",
        complete: () => {
            msg.remove();
        },
      });
    }

    const serviceMessage = (msg, queueId) => {
      const queueConfig = QUEUE_CONFIGS.find(config => config.queueId === queueId);
      let queueDuration = queueConfig ? queueConfig.duration : 2000;
      let messageId = messageIds[queueId]++;

      let messageProgressArray = queueMessageProgresses[queueId];
      let messagesBeingServiced = currentQueueMessageCounts[queueId];
      let lastQueuedMessageProgress = messageProgressArray.slice(-1)[0] ?? 0;
      let servicingDelayMs = 50;

      queueDuration = 
                    queueDuration // How long it would take to service if 0 messages in queue
                    + (messagesBeingServiced * servicingDelayMs) // How much to delay it because of queued messages
                    - lastQueuedMessageProgress; // How much to speed it up because the next message's progress already
      if (queueId == 'queue-2') {
      console.log(queueId + ': ' + queueDuration);
      console.log('-');
      }
      anime({
          targets: msg,
          delay: 0,
          keyframes: [
            { 
                translateX: POSITIONS[queueId.toUpperCase() + '_END'].x, 
                translateY: POSITIONS[queueId.toUpperCase() + '_END'].y, 
                duration: queueDuration
            }
        ],
        easing: "linear", 
        begin: () => {
            // Increase the message count when a message enters the queue
            currentQueueMessageCounts[queueId]++;
            queueMessageProgresses[queueId][messageId] = 0;
        },
        complete: () => {
            dequeueMessage(msg);
            queueMessageProgresses[queueId][messageId] = 0;
            currentQueueMessageCounts[queueId]--;
        },
        update: function(anim) {
          queueMessageProgresses[queueId][messageId] = anim.currentTime;
        },
      });
    }

    const serviceAbrl = (msg, toQueueId) => {
      let queueId = 'queue-4';
      const queueConfig = QUEUE_CONFIGS.find(config => config.queueId === queueId);
      let queueDuration = queueConfig ? queueConfig.duration : 2000;
      let messageId = messageIds[queueId]++;

      let messageProgressArray = queueMessageProgresses[queueId];
      let messagesBeingServiced = currentQueueMessageCounts[queueId];
      let lastQueuedMessageProgress = messageProgressArray.slice(-1)[0] ?? 0;
      let servicingDelayMs = 50;

      queueDuration = 
                    queueDuration // How long it would take to service if 0 messages in queue
                    + (messagesBeingServiced * servicingDelayMs) // How much to delay it because of queued messages
                    - lastQueuedMessageProgress; // How much to speed it up because the next message's progress already
                    - 200;
      anime({
          targets: msg,
          delay: 0,
          keyframes: [
            { 
                translateX: POSITIONS['QUEUE-4_END'].x, 
                translateY: POSITIONS['QUEUE-4_END'].y, 
                duration: queueDuration
            }
        ],
        easing: "linear", 
        begin: () => {
            // Increase the message count when a message enters the queue
            currentQueueMessageCounts[queueId]++;
            queueMessageProgresses[queueId][messageId] = 0;
        },
        complete: () => {
            reQueueMessage(msg, toQueueId);
            queueMessageProgresses[queueId][messageId] = 0;
            currentQueueMessageCounts[queueId]--;
        },
        update: function(anim) {
          queueMessageProgresses[queueId][messageId] = anim.currentTime;
        },
      });
    }

    const enqueueMessage = (queueId) => {
      const msg = icon_message_el.cloneNode(true);
      msg.style.display = "inherit";
      msg.style.transformBox = "fill-box";
      msg.style.transformOrigin = "center center";
      msg.classList.add("message-clone");
      svg.appendChild(msg);

      anime({
          targets: msg,
          keyframes: [
            { translateX: POSITIONS.APP.x, translateY: POSITIONS.APP.y + anime.random(-200,200), duration: 0, scale: 0 },
            { translateX: POSITIONS.APP.x, translateY: POSITIONS.APP.y, duration: 250, scale: 1 },
            { translateX: POSITIONS.TWLO.x, translateY: POSITIONS.APP.y, duration: 250 },
            { 
                translateX: POSITIONS['QUEUE-4_START'].x, 
                translateY: POSITIONS['QUEUE-4_START'].y, 
                duration: 100
            }
        ],
        easing: "linear", 
        begin: () => {
        },
        complete: () => {
          serviceAbrl(msg, queueId);
        }
      });
    };

    const reQueueMessage = (msg, queueId) => {
      anime({
          targets: msg,
          keyframes: [
            { 
                translateX: POSITIONS[queueId.toUpperCase() + '_START'].x, 
                translateY: POSITIONS[queueId.toUpperCase() + '_START'].y, 
                duration: 100
            }
        ],
        easing: "linear", 
        begin: () => {
        },
        complete: () => {
          serviceMessage(msg, queueId);
        }
      });
    };

    ANIMATION_ORDERS.forEach(order => {
        let startTime = order.startDelay;
        for (let i = 0; i < order.messageCount; i++) {
            timeoutIds.push(
              setTimeout(() => enqueueMessage(order.queueId), startTime)
            );
            startTime += order.messageSpacing;
        }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (autoplay) {
      setTimeout(initializeAnimations, 100);
    }
    playButton.addEventListener("click", resetAnimations);
    setTimeout(addTitles, 100);
  });