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
  const MPS_TO_DURATION_MS = 60;
  let titles = [
      { 
          "borderId": "parent-queue",
          "title": "US-OpenMarket-ShortCode-SMS STT Queue <span class='mps'>SET TO " + TOTAL_MPS + " MPS</span>",
      },
      { 
          "borderId": "tier-1",
          "title": "Carrier Tier 1 <span class='mps'>86% weight [<span class='tier-1-rate'>0.00</span>/" + TOTAL_MPS + " MPS]</span>"
      },
      { 
          "borderId": "tier-2",
          "title": "Carrier Tier 2 <span class='mps'>14% weight [<span class='tier-2-rate'>0.00</span>/" + TOTAL_MPS + " MPS]</span>"
      },
      { 
          "borderId": "att",
          "title": "AT&T <span class='mps'><span id='att-rate'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "tmo",
          "title": "T-Mobile <span class='mps'><span id='tmo-rate'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "vzw",
          "title": "Verizon <span class='mps'><span id='vzw-rate'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "aerialink",
          "title": "Aeiralink <span class='mps'><span id='aerialink-rate'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "appalachian",
          "title": "Appalachian Wireless <span class='mps'><span id='appalachian-rate'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "bluegrass",
          "title": "Bluegrass Wireless <span class='mps'><span id='bluegrass-rate'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "brightlink",
          "title": "Brightlink <span class='mps'><span id='brightlink-rate'>0.00</span> MPS</span>"
      }
  ];
  let POSITIONS;

  let ANIMATION_ORDERS = [
      {queueId: 'att', startDelay: 0, messageSpacing: 400, messageCount: 9, messageType: 'ac1-sl1'},
      {queueId: 'tmo', startDelay: 100, messageSpacing: 300, messageCount: 6, messageType: 'ac1-sl1'},
      {queueId: 'vzw', startDelay: 200, messageSpacing: 100, messageCount: 20, messageType: 'ac1-sl1'},
      {queueId: 'aerialink', startDelay: 200, messageSpacing: 400, messageCount: 1, messageType: 'ac1-sl1'},
      {queueId: 'bluegrass', startDelay: 3500, messageSpacing: 200, messageCount: 1, messageType: 'ac1-sl1'},
  ];

  const DEFAULT_QUEUE_DURATION = 200;
  let TIERS = {
    'tier-1': {weight: 86, subs: ['att', 'tmo', 'vzw']},
    'tier-2': {weight: 14, subs: ['aerialink','appalachian','bluegrass','brightlink']},
  };

  let QUEUE_CONFIGS = {
      'att': {queueId: 'att', duration: DEFAULT_QUEUE_DURATION, steps: 8, weight: 1, tier: 'tier-1'},
      'tmo': {queueId: 'tmo', duration: DEFAULT_QUEUE_DURATION, steps: 8, weight: 1, tier: 'tier-1'},
      'vzw': {queueId: 'vzw', duration: DEFAULT_QUEUE_DURATION, steps: 8, weight: 1, tier: 'tier-1'},
      'aerialink': {queueId: 'aerialink', duration: DEFAULT_QUEUE_DURATION, steps: 8, weight: 1, tier: 'tier-2'},
      'appalachian': {queueId: 'appalachian', duration: DEFAULT_QUEUE_DURATION, steps: 8, weight: 1, tier: 'tier-2'},
      'bluegrass': {queueId: 'bluegrass', duration: DEFAULT_QUEUE_DURATION, steps: 8, weight: 1, tier: 'tier-2'},
      'brightlink': {queueId: 'brightlink', duration: DEFAULT_QUEUE_DURATION, steps: 8, weight: 1, tier: 'tier-2'},
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

    const shape = () => {
      // console.clear();
      let rates = {};
      let durations = {};

      let totalWeight = 0;
      let totalTierWeight = 0;
      let queueOn = 0;
      let tierWeights = {};
      let tierMessages = {};
      let tierActiveSubs = {};
      let tierOn = 0;

      for (const tierId of Object.keys(TIERS)) {
        tierMessages[tierId] = 0;
        tierActiveSubs[tierId] = [];
        TIERS[tierId].subs.forEach(subQueueId => {
          tierMessages[tierId] += currentQueueMessageCounts[subQueueId];
          if (currentQueueMessageCounts[subQueueId] > 0) {
            tierActiveSubs[tierId].push(subQueueId);
          }
        });
        totalTierWeight += tierMessages[tierId] > 0 ? TIERS[tierId].weight : 0;
      }

      for (const tierId of Object.keys(TIERS)) {
        tierOn = (tierMessages[tierId] > 0) ? 1 : 0;
        rates[tierId] = tierOn * TIERS[tierId].weight / totalTierWeight * TOTAL_MPS;
        rates[tierId] = isNaN(rates[tierId]) ? 0 : rates[tierId];
        let rateElms = document.querySelectorAll(`.${tierId}-rate`);
        comparePastRates(tierId, rateElms, rates);
        rateElms.forEach(el => el.innerText = rates[tierId].toFixed(2));
      }

      for (const queueId of Object.keys(QUEUE_CONFIGS)) { 
        let queueTierId = QUEUE_CONFIGS[queueId].tier;
        let tierRate = rates[queueTierId];
        let tierActiveSubsCount = tierActiveSubs[queueTierId].length;
        queueOn = (currentQueueMessageCounts[queueId] > 0) ? 1 : 0;
        rates[queueId] = (queueOn / tierActiveSubsCount) * tierRate;
        rates[queueId] = isNaN(rates[queueId]) ? 0 : rates[queueId];
        durations[queueId] = rates[queueId] === 0 ? DEFAULT_QUEUE_DURATION : Math.ceil(1 / rates[queueId] * (DEFAULT_QUEUE_DURATION * MPS_TO_DURATION_MS));
        let queueRateElms = document.querySelectorAll(`#${queueId}-rate`);
        comparePastRates(queueId, queueRateElms, rates);
        queueRateElms.forEach(el => el.innerText = rates[queueId].toFixed(2));
        QUEUE_CONFIGS[queueId].duration = durations[queueId];
      }
  };

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
    pulsePlay();
  });