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
          "title": "US-ATT SHORT CODE SMS QUEUE <span class='mps'>TOTAL [" + TOTAL_MPS + " MPS]</span>",
      },
      { 
          "borderId": "tier-1-sl-1",
          "title": "Tier 1 <span class='mps'>60% weight [<span class='sl-1-tier-1-rate rates'>0.00</span>/<span class='sl-1-rate rates'>0.00</span> MPS]</span>"
      },
      { 
          "borderId": "tier-2-sl-1",
          "title": "Tier 2 <span class='mps'>40% weight [<span class='sl-1-tier-2-rate rates'>0.00</span>/<span class='sl-1-rate rates'>0.00</span> MPS]</span>"
      },
      { 
          "borderId": "tier-1-sl-2",
          "title": "Tier 1 <span class='mps'>60% weight [<span class='sl-2-tier-1-rate rates'>0.00</span>/<span class='sl-2-rate rates'>0.00</span> MPS]</span>"
      },
      { 
          "borderId": "tier-2-sl-2",
          "title": "Tier 2 <span class='mps'>40% weight [<span class='sl-2-tier-2-rate rates'>0.00</span>/<span class='sl-2-rate rates'>0.00</span> MPS]</span>"
      },
      { 
          "borderId": "sub-1-sl-1",
          "subtitle": "Subaccount 1 <span class='mps'><span class='sub-1-sl-1-rate rates'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "sub-2-sl-1",
          "subtitle": "Subaccount 2 <span class='mps'><span class='sub-2-sl-1-rate rates'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "sub-3-sl-1",
          "subtitle": "Subaccount 3 <span class='mps'><span class='sub-3-sl-1-rate rates'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "sub-1-sl-2",
          "subtitle": "Subaccount 1 <span class='mps'><span class='sub-1-sl-2-rate rates'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "sub-2-sl-2",
          "subtitle": "Subaccount 2 <span class='mps'><span class='sub-2-sl-2-rate rates'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "sub-3-sl-2",
          "subtitle": "Subaccount 3 <span class='mps'><span class='sub-3-sl-2-rate rates'>0.00</span> MPS</span>"
      },
      { 
          "borderId": "important",
          "title": "Important <span class='mps'>SL1 70% weight [<span class='sl-1-rate rates'>0.00</span>/" + TOTAL_MPS + " MPS]</span>",
      },
      { 
          "borderId": "regular",
          "title": "Regular <span class='mps'>SL2 30% weight [<span class='sl-2-rate rates'>0.00</span>/" + TOTAL_MPS + " MPS]</span>",
      },
  ];
  let POSITIONS;

// Ugh -- messageType is the svg name and I have them backwards sl1/sl2 woops

  let ANIMATION_ORDERS = [
      {queueId: 'sub-2-sl-2', startDelay: 0, messageSpacing: 500, messageCount: 5, messageType: 'ac1-sl1'},
      {queueId: 'sub-3-sl-2', startDelay: 100, messageSpacing: 600, messageCount: 12, messageType: 'ac2-sl1'},
      {queueId: 'sub-1-sl-2', startDelay: 700, messageSpacing: 100, messageCount: 20, messageType: 'ac3-sl1'},
      {queueId: 'sub-3-sl-1', startDelay: 1400, messageSpacing: 400, messageCount: 2, messageType: 'ac2-sl2'},
      {queueId: 'sub-1-sl-1', startDelay: 1600, messageSpacing: 100, messageCount: 5, messageType: 'ac3-sl2'},
      {queueId: 'sub-3-sl-1', startDelay: 6400, messageSpacing: 200, messageCount: 2, messageType: 'ac2-sl2'},
      {queueId: 'sub-3-sl-1', startDelay: 1600, messageSpacing: 300, messageCount: 1, messageType: 'ac3-sl2'},
  ];

  const DEFAULT_QUEUE_DURATION = 100;
  let LEVELS = {
    'sl-1': {weight: 7},
    'sl-2': {weight: 3},
  };

  let TIERS = {
    'tier-1': {weight: 6},
    'tier-2': {weight: 4},
  };

  let QUEUE_CONFIGS = {
      'sub-1-sl-1': {queueId: 'sub-1-sl-1', duration: DEFAULT_QUEUE_DURATION, steps: 10, tier: 'tier-2', level: 'sl-1'},
      'sub-2-sl-1': {queueId: 'sub-2-sl-1', duration: DEFAULT_QUEUE_DURATION, steps: 10, tier: 'tier-2', level: 'sl-1'},
      'sub-3-sl-1': {queueId: 'sub-3-sl-1', duration: DEFAULT_QUEUE_DURATION, steps: 10, tier: 'tier-1', level: 'sl-1'},
      'sub-1-sl-2': {queueId: 'sub-1-sl-2', duration: DEFAULT_QUEUE_DURATION, steps: 10, tier: 'tier-2', level: 'sl-2'},
      'sub-2-sl-2': {queueId: 'sub-2-sl-2', duration: DEFAULT_QUEUE_DURATION, steps: 10, tier: 'tier-2', level: 'sl-2'},
      'sub-3-sl-2': {queueId: 'sub-3-sl-2', duration: DEFAULT_QUEUE_DURATION, steps: 10, tier: 'tier-1', level: 'sl-2'},
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
    document.querySelectorAll(`.rates`).forEach(el => el.innerText = '0.00');

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
      console.clear();
      // this function is called every time a message enters or leaves any queue
      // which could potentially change the nature of the shape of the traffic
      // the queue tallies are stored in currentQueueMessageCounts an array
      // currentQueueMessageCounts is keyed by queueId like "sub-3-sl-1"
      // the QUEUE_CONFIGS object is keyed by the queueId too
      // and it contains things like the queue's level and tier

      // ultimately we need to assign an MPS to each one of these queues, something ranging between 0 and TOTAL_MPS
      // each level will have an MPS (sl-1-rate...)
      // each tier within each level will have an MPS (sl-1-tier-1-rate...)
      // finally, each queue within each level within each tier will need an MPS (sub-1-sl-1-rate....)

      let counts = {};
      let rates = {};
      let queueOn = {};

      for (const queueId of Object.keys(QUEUE_CONFIGS)) { 
        let count = currentQueueMessageCounts[queueId];
        let tierId = QUEUE_CONFIGS[queueId].tier;
        let levelId = QUEUE_CONFIGS[queueId].level;
        // add to the levels message count
        counts[levelId] = (counts[levelId] || 0) + currentQueueMessageCounts[queueId];

        // how many subs/queues within a given
        // level tier have messages?
        queueOn[queueId] = currentQueueMessageCounts[queueId] > 0 ? 1 : 0;
        counts[levelId + tierId] = (counts[levelId + tierId] || 0) + (queueOn[queueId] > 0 ? 1 : 0);
      };

      // only once the loop above is done do we know the level and level-tier counts
      
      // now knowing the current counts in the level and in each tier within
      // each level, let's calculate the total weight being used in 
      // levels and in the level-tiers

      let totalLevelActiveWeight = 0;
      let totalLevelTierActiveWeight = {};
      let totalLevelTierSubsActiveCount = {};
      for (const levelId of Object.keys(LEVELS)) { 
        totalLevelTierActiveWeight[levelId] = 0;
        totalLevelActiveWeight += counts[levelId] > 0 ? LEVELS[levelId].weight : 0;
        for (const tierId of Object.keys(TIERS)) {
          totalLevelTierActiveWeight[levelId] += counts[levelId + tierId] > 0 ? TIERS[tierId].weight : 0;
        }
      }

      // now that we know the level weight, we can assign MPS to each level
      // and we can do the same for each tier in each level
      for (const levelId of Object.keys(LEVELS)) { 
        rates[levelId] = counts[levelId] > 0 ? ((LEVELS[levelId].weight / totalLevelActiveWeight) * TOTAL_MPS) : 0;
        let rateElms = document.querySelectorAll(`.${levelId}-rate`);
        comparePastRates(levelId, rateElms, rates);
        rateElms.forEach(el => el.innerText = rates[levelId].toFixed(2));        
        for (const tierId of Object.keys(TIERS)) {
          rates[levelId + tierId] = counts[levelId + tierId] > 0 ? ((TIERS[tierId].weight / totalLevelTierActiveWeight[levelId]) * rates[levelId]) : 0;

          let tierRateElms = document.querySelectorAll(`.${levelId}-${tierId}-rate`);
          comparePastRates(levelId + tierId, tierRateElms, rates);

          tierRateElms.forEach(el => el.innerText = rates[levelId + tierId].toFixed(2));
        }
      }

      // subaccount queues -- each gets assigned an mps split amongst the parent tier
      for (const queueId of Object.keys(QUEUE_CONFIGS)) {
        let count = currentQueueMessageCounts[queueId];
        let tierId = QUEUE_CONFIGS[queueId].tier;
        let levelId = QUEUE_CONFIGS[queueId].level;

        let parentTierMps = rates[levelId + tierId];
        let share = 1 / counts[levelId + tierId];
        rates[queueId] = queueOn[queueId] * share * parentTierMps;
        rates[queueId] = isNaN(rates[queueId]) ? 0 : rates[queueId];
        let queueRateElms = document.querySelectorAll(`.${queueId}-rate`);
        comparePastRates(queueId, queueRateElms, rates);
        queueRateElms.forEach(el => el.innerText = rates[queueId].toFixed(2));

        let duration = rates[queueId] === 0 ? DEFAULT_QUEUE_DURATION : Math.ceil(1 / rates[queueId] * (DEFAULT_QUEUE_DURATION * MPS_TO_DURATION_MS));
        QUEUE_CONFIGS[queueId].duration = duration;
      };
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
    pulsePlay();
  });