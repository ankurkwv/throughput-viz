  let currentQueueMessageCounts = [];
  let messageIds = [];
  let timeoutIds = [];
  let playButton = document.querySelector("#play");
  const urlParams = new URLSearchParams(window.location.search);
  const autoplay = urlParams.get('autoplay');
  const MESSAGE_TYPES = [
    'ac1-sl1', 'ac2-sl1', 'ac3-sl1',
    'ac1-sl2', 'ac2-sl2', 'ac3-sl2'
  ];
  const TOTAL_MPS = 75;
  const MPS_TO_DURATION_MS = 60;
  let titles = [
      { 
          "borderId": "path-1",
          "title": "US-ATT SHORT CODE SMS QUEUES",
          "subtitle": TOTAL_MPS + " MPS TOTAL"
      },
      { 
          "borderId": "sub-1",
          "title": "Subaccount 1 (AC1)",
          "subtitle": "[<span id='sub-1-rate'>0.00</span>/" + TOTAL_MPS + " MPS]"
      },
      { 
          "borderId": "sub-2",
          "title": "Subaccount 2 (AC2)",
          "subtitle": "[<span id='sub-2-rate'>0.00</span>/" + TOTAL_MPS + " MPS]"
      },
      { 
          "borderId": "sub-3",
          "title": "Subaccount 3 (AC3)",
          "subtitle": "[<span id='sub-3-rate'>0.00</span>/" + TOTAL_MPS + " MPS]"
      },
  ];
  let POSITIONS;

  let ANIMATION_ORDERS = [
      {queueId: 'sub-1', startDelay: 0, messageSpacing: 500, messageCount: 5, messageType: 'ac1-sl1'},
      {queueId: 'sub-2', startDelay: 100, messageSpacing: 600, messageCount: 10, messageType: 'ac2-sl1'},
      {queueId: 'sub-3', startDelay: 200, messageSpacing: 100, messageCount: 60, messageType: 'ac3-sl1'},
      {queueId: 'sub-2', startDelay: 1400, messageSpacing: 400, messageCount: 2, messageType: 'ac2-sl2'},
      {queueId: 'sub-3', startDelay: 1600, messageSpacing: 100, messageCount: 5, messageType: 'ac3-sl2'},
      {queueId: 'sub-2', startDelay: 6400, messageSpacing: 200, messageCount: 4, messageType: 'ac2-sl2'},
      {queueId: 'sub-3', startDelay: 6600, messageSpacing: 300, messageCount: 3, messageType: 'ac3-sl2'},
  ];

  const DEFAULT_QUEUE_DURATION = 200;
  let QUEUE_CONFIGS = {
      'sub-1': {queueId: 'sub-1', duration: DEFAULT_QUEUE_DURATION , steps: 6, weight: 1},
      'sub-2': {queueId: 'sub-2', duration: DEFAULT_QUEUE_DURATION , steps: 6, weight: 1},
      'sub-3': {queueId: 'sub-3', duration: DEFAULT_QUEUE_DURATION , steps: 6, weight: 1},
  };

  const createDiv = (className, text, style) => {
    const div = document.createElement('div');
    div.className = className;
    if (text) div.innerHTML = text;
    Object.assign(div.style, style);
    document.body.appendChild(div);
    return div;
  };

  const addTitles = () => {
    titles.forEach(({borderId, title, subtitle}) => {
      const borderElement = document.querySelector(`#${borderId}`);
      if(!borderElement) return;

      const bbox = getAugmentedBbox(borderElement, true);
      const titleDiv = createDiv('svg-title', title, { left: `${bbox.x + 6}px`, top: `${bbox.y - 14}px` });

      if (subtitle) {
        const subtitleDiv = createDiv('svg-subtitle', subtitle, { right: `${bbox.xRight}px`});
        subtitleDiv.style.top = `${bbox.yBottom - subtitleDiv.offsetHeight}px`;
      }
    });
  };

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
    playButton.innerText = 'Restart Animation'
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
      
      MESSAGE_TYPES.forEach(type => {
        document.querySelector(`#${type}`).style.display = 'none';
      })

      Object.entries(QUEUE_CONFIGS).forEach(config => {
          config = config[1];
          const queueBbox = getAugmentedBbox(document.querySelector(`#${config.queueId}`));
          
          POSITIONS[config.queueId.toUpperCase() + '_START'] = {
              x: queueBbox.x,
              y: queueBbox.y + queueBbox.height / 2 - messageHeight / 2
          };
          
          POSITIONS[config.queueId.toUpperCase() + '_END'] = {
              x: queueBbox.x + queueBbox.width - 10,
              y: queueBbox.y + queueBbox.height / 2 - messageHeight / 2
          };

          let incrementalDistance = queueBbox.width / config.steps;
          let i = 1;
          let step = 0;
          while (i <= config.steps) {
            step += incrementalDistance;
            POSITIONS[config.queueId.toUpperCase() + '_STEP_' + i] = { x: queueBbox.x + step };  
            i += 1;
          }
          
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

    const flashRectangle = (rectangle) => {
      anime({
        targets: rectangle,
        fill: [
          { value: '#FFFFB3', duration: 200, easing: 'easeOutSine' },
          { value: '#D8D8D8', duration: 200, easing: 'easeInSine' }
        ],
        delay: anime.stagger(100),
        loop: false
      });
    }

    let lastDurations = {};
    const shape = () => {
      let rates = {};
      let durations = {};

      let totalWeight = 0;
      let queueOn = 0;
      for (const queueId of Object.keys(QUEUE_CONFIGS)) {
          totalWeight += currentQueueMessageCounts[queueId] > 0 ? QUEUE_CONFIGS[queueId].weight : 0;
        }
      for (const queueId of Object.keys(QUEUE_CONFIGS)) { 
          queueOn = (currentQueueMessageCounts[queueId] > 0) ? 1 : 0;
          rates[queueId] = (totalWeight === 0) ? 0 : (queueOn * QUEUE_CONFIGS[queueId].weight / totalWeight) * TOTAL_MPS;
          durations[queueId] = rates[queueId] === 0 ? DEFAULT_QUEUE_DURATION : Math.ceil(1 / rates[queueId] * (DEFAULT_QUEUE_DURATION * MPS_TO_DURATION_MS));

          document.querySelector(`#${queueId}-rate`).innerText = rates[queueId].toFixed(2);
          QUEUE_CONFIGS[queueId].duration = durations[queueId];

          if (durations[queueId] !== lastDurations[queueId]) {
              flashRectangle(document.querySelector(`#${queueId}`));
          }
      }

      lastDurations = {...durations};
  };

    const shaped = () => {
      let mps = 75;
      let sl1_w = 50;
      let sl2_w = 20;
      let sl1_on = (currentQueueMessageCounts['sl-1'] > 0) ? 1 : 0;
      let sl2_on = (currentQueueMessageCounts['sl-2'] > 0) ? 1 : 0;

      sl1_rate = ((sl1_w * sl1_on) / ((sl1_w * sl1_on) + (sl2_w * sl2_on))) * mps;
      sl2_rate = ((sl2_w * sl2_on) / ((sl1_w * sl1_on) + (sl2_w * sl2_on))) * mps;

      sl1_rate = isNaN(sl1_rate) ? 0 : sl1_rate;
      sl2_rate = isNaN(sl2_rate) ? 0 : sl2_rate;

      document.querySelector('#sl-1-rate').innerText = sl1_rate.toFixed(2);
      document.querySelector('#sl-2-rate').innerText = sl2_rate.toFixed(2);

      sl1_duration = (sl1_rate == 0) ? DEFAULT_QUEUE_DURATION : Math.ceil(1 / sl1_rate * (DEFAULT_QUEUE_DURATION * 60));
      sl2_duration = (sl2_rate == 0) ? DEFAULT_QUEUE_DURATION : Math.ceil(1 / sl2_rate * (DEFAULT_QUEUE_DURATION * 60));

      if (sl1_duration - lastSl1 !== 0) {
        flashRectangle(document.querySelector(`#sl-1`));
      }
      if (sl2_duration - lastSl2 !== 0) {
        flashRectangle(document.querySelector(`#sl-2`));
      }

      lastSl1 = sl1_duration;
      lastSl2 = sl2_duration;

      QUEUE_CONFIGS['sl-1'].duration = sl1_duration;
      QUEUE_CONFIGS['sl-2'].duration = sl2_duration;
    }

    const serviceMessage = (msg, queueId, step) => {
      const queueConfig = QUEUE_CONFIGS[queueId];
      let queueDuration = queueConfig ? queueConfig.duration : 2000;
      let messageId = messageIds[queueId]++;

      let messagesBeingServiced = currentQueueMessageCounts[queueId];
      let servicingDelayMs = 10;

      queueDuration = 
                    queueDuration // How long it would take to service if 0 messages in queue
                    + (messagesBeingServiced * servicingDelayMs) // How much to delay it because of queued messages

      let animation = anime({
          targets: msg,
          delay: 0,
          keyframes: [
            { 
                translateX: POSITIONS[queueId.toUpperCase() + '_STEP_' + step].x,
                duration: queueDuration
            }
        ],
        easing: "linear", 
        begin: () => {
            if (step == 1) {
              currentQueueMessageCounts[queueId]++;
            }
            shape();
            
        },
        complete: () => {
            if (step == queueConfig.steps) {
              dequeueMessage(msg);
              currentQueueMessageCounts[queueId]--;
            }
            else {
              console.log(step+1);
              console.log(queueConfig.steps);
              serviceMessage(msg, queueId, step + 1);
            }
            shape();
        }
      });
    }

    const enqueueMessage = (queueId, messageType) => {
      const msg = document.querySelector(`#${messageType}`).cloneNode(true);
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
                translateX: POSITIONS[queueId.toUpperCase() + '_START'].x, 
                translateY: POSITIONS[queueId.toUpperCase() + '_START'].y, 
                duration: 500
            }
        ],
        easing: "linear", 
        begin: () => {
        },
        complete: () => {
          serviceMessage(msg, queueId, 1);
        }
      });
    };

    ANIMATION_ORDERS.forEach(order => {
        let startTime = order.startDelay;
        let messageSpacing = order.messageSpacing;
        for (let i = 0; i < order.messageCount; i++) {
            if (order.randomizeSpacing) {
              messageSpacing = anime.random(messageSpacing - 21, messageSpacing + 21);
            }
            timeoutIds.push(
              setTimeout(() => enqueueMessage(order.queueId, order.messageType), startTime)
            );
            startTime += messageSpacing;
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