class MovingSprite {
    constructor(index, type, soundFilename) {
        this.index = index;
        this.type = type;
        this.hp = 100;
        this.isMoving = false;
        this.imageUrl = '';
        this.name = `${type}-${index}`;
        this.hpBar = '';
        this.element = '';
        this.extraCssClassNames = '';
        this.isInvincible = false;
        this.soundFilename = soundFilename;
        this.sound = undefined;

        this.initialX = 0;
        this.initialY = 0;
        this.init();
    }

    init() {
        //console.log(`${this.name} init()`);

        switch (this.type) {
            case 'dench-head':
                this.initialX = window.innerWidth;
                this.initialY = window.innerHeight;
                if (philomania.denchHeadImgs.length === 0) {
                    philomania.regenerateDenchHeadImgList();
                }
                this.imageUrl = philomania.denchHeadImgs.pop();
                this.extraCssClassNames = 'dench-head';

                var mp3Url = `${philomania.baseS3Url}/audio/${this.soundFilename}`;
                this.sound = new Audio(mp3Url);
                break;
            case 'phil-head':
                this.imageUrl = `${philomania.baseS3Url}/img/phil_head_1.png`;
                break;
        }

        this.generateHtml();
    }

    deinit() {
        //console.log(`${this.name} deinit()`);
        this.element.parentNode.removeChild(this.element);
    }

    generateHtml() {
        //console.log(`${this.name} generateHtml()`);
        var containerDiv = document.createElement('div');
        containerDiv.className = `moving-sprite ${this.extraCssClassNames}`;
        containerDiv.setAttribute('id', this.name);
        containerDiv.setAttribute('index', this.index);
        containerDiv.style.top = this.initialY - 100 + 'px';
        containerDiv.style.left = this.initialX - 100 + 'px';
        containerDiv.style.backgroundImage = `url(${this.imageUrl})`;

        var hpBar = document.createElement('progress');
        hpBar.className = 'moving-sprite-hp-bar';
        hpBar.setAttribute('id', `${this.name}-hp-bar`);
        hpBar.setAttribute('max', `${this.hp}`);
        hpBar.value = this.hp;
        containerDiv.appendChild(hpBar);
        document.body.appendChild(containerDiv);

        this.hpBar = document.getElementById(`${this.name}-hp-bar`);
        this.element = document.getElementById(this.name);
        this.element.addEventListener('transitionend', function(e) {
            var denchHead = philomania.getDenchHeadFromEvent(e);
            denchHead.isMoving = false;
        });
    }

    move() {
        if (!this.isMoving) {
            //console.log(`${this.name} move()`);
            this.isMoving = true;
            let windowHeight = window.innerHeight;
            let windowWidth = window.innerWidth;
            let elementWidth = this.element.offsetWidth;
            let elementHeight = this.element.offsetHeight;
            let newX = randomIntFromInterval(0, windowWidth - elementWidth);
            let newY = randomIntFromInterval(0, windowHeight - elementHeight);

            let transitionTime = randomIntFromInterval(300, 8000);
            this.element.style.transition = transitionTime + 'ms';
            this.element.style.top = newY + 'px';
            this.element.style.left = newX + 'px';
        }
    }
}

var philomania = {
    'baseS3Url'             : '',
    'backgroundUrlsMaster'  : [],
    'backgroundUrls'        : [],
    'numDenchSounds'        : 7,
    'denchSounds'           : [],
    'numDenchHeadImgs'      : 10,
    'denchHeadImgs'         : [],
    'philHead'              : undefined,
    'numDenchHeads'         : 2,
    'denchHeads'            : [],
    'eventLoopMs'           : 500,
    'eventLoopTimer'        : undefined,
    'hitStrengthHP'         : 20,
    'invincibleTimeMs'      : 1000,
    'currentRound'          : 1,
    'totalRoundMs'          : 20000,  // 20 seconds
    'roundMsRemaining'      : 20000,  // 20 seconds
    'currentPoints'         : 0,
    'numPointsAwarded'      : 100,
    'roundLabel'            : document.getElementById('round-value'),
    'secondsRemainingLabel' : document.getElementById('seconds-remaining-value'),
    'pointsLabel'           : document.getElementById('points-value'),
    'modal'                 : document.getElementById('modal'),
    'modalTitle'            : document.getElementsByClassName('modal-title')[0],
    'modalSubTitle'         : document.getElementsByClassName('modal-subtitle')[0],
    'modalBody'             : document.getElementsByClassName('modal-body')[0],
    'modalActions'          : document.getElementsByClassName('modal-actions')[0],
    'modalCountdown'        : document.getElementsByClassName('modal-countdown')[0]

};

philomania.init = function() {
    philomania.generateDenchSounds();
    philomania.updateGameBackground();
    philomania.startGameBtn();
};

philomania.generateDenchSounds = function() {
    //console.log('philomania.generateDenchSounds()');
    for (var i=1; i<=philomania.numDenchSounds; i++) {
        let mp3Filename = `dench_${i}.mp3`;
        philomania.denchSounds.push(mp3Filename);
    }
    shuffle(philomania.denchSounds);
};

philomania.updateGameBackground = function() {
    //console.log('philomania.updateGameBackground()');

    if (philomania.backgroundUrls.length === 0) {
        //console.log('Populating new game backgrounds list...');
        for (var i=0; i<philomania.backgroundUrlsMaster.length; i++) {
            philomania.backgroundUrls.push(philomania.backgroundUrlsMaster[i]);
        }
        shuffle(philomania.backgroundUrls)
    }

    var newGameBackground = philomania.backgroundUrls.pop();
    document.body.style.background = `url(${newGameBackground}) no-repeat center center fixed`;
    if (philomania.backgroundUrls.length === 0) {
        document.body.style.backgroundColor = randomColor();
    }
};

philomania.startGameBtn = function() {
    document.getElementById('start-game-btn').onclick = function() {
        document.getElementsByClassName('game-ui-labels')[0].style.display = 'inline-block';
        philomania.dismissModal();
        philomania.generatePhilHead();
        philomania.generateDenchHeads();
        philomania.startGameLoop();
    }
};

philomania.generatePhilHead = function() {
    //console.log('philomania.generatePhilHead()');
    if (philomania.philHead !== undefined) {
        philomania.philHead.deinit();
    }

    philomania.philHead = new MovingSprite(0, 'phil-head');
    document.addEventListener('mousemove', function(e) {
        philomania.philHead.element.style.left = e.clientX + 'px';
        philomania.philHead.element.style.top = e.clientY + 'px';

        // Detect collisions while moving cursor
        for (var i in philomania.denchHeads) {
            let head = philomania.denchHeads[i];
            if (detectCollision(head.element, philomania.philHead.element)) {
                philomania.collisionDetected(head);
                break;
            }
        }
    });
};

philomania.generateDenchHeads = function() {
    //console.log('philomania.generateDenchHeads()');
    for (var i=0; i<philomania.denchHeads.length; i++) {
        let head = philomania.denchHeads[i];
        head.deinit();
    }
    philomania.denchHeads = [];

    for (var j=0; j<philomania.numDenchHeads; j++) {
        if (philomania.denchSounds.length === 0) {
            philomania.generateDenchSounds();
        }
        var denchSound = philomania.denchSounds.pop();
        var denchHead = new MovingSprite(j, 'dench-head', denchSound);
        philomania.denchHeads.push(denchHead);
    }
};

philomania.startGameLoop = function() {
    //console.log('philomania.startGameLoop()');

    philomania.secondsRemainingLabel.innerHTML = philomania.roundMsRemaining / 1000;
    philomania.eventLoopTimer = setInterval(function() {
        if (philomania.roundMsRemaining <= 0) {
            // Round over!  Start next round!
            philomania.stopGameLoop();
            philomania.startNextRound();
            return;
        }

        // Main game loop
        for (var i in philomania.denchHeads) {
            let head = philomania.denchHeads[i];
            // Move Dench Heads
            head.move();

            // Detect collisions
            if (detectCollision(head.element, philomania.philHead.element)) {
                philomania.collisionDetected(head);
                break;
            }
        }

        philomania.roundMsRemaining -= philomania.eventLoopMs;
        if (philomania.roundMsRemaining % 1000 === 0) {
            philomania.updatePoints();
            philomania.secondsRemainingLabel.innerHTML = philomania.roundMsRemaining / 1000;
        }
    }, philomania.eventLoopMs);
};

philomania.stopGameLoop = function() {
    //console.log('philomania.stopGameLoop()');
    clearInterval(philomania.eventLoopTimer);
};

philomania.startNextRound = function() {
    //console.log('philomania.startNextRound()');

    philomania.roundMsRemaining = philomania.totalRoundMs;
    philomania.currentRound += 1;
    philomania.numDenchHeads = 2 * philomania.currentRound;

    // Show next round modal
    philomania.secondsRemainingLabel.innerHTML = philomania.roundMsRemaining / 1000;
    philomania.roundLabel.innerHTML = philomania.currentRound;

    philomania.updateGameBackground();
    philomania.generatePhilHead();
    philomania.generateDenchHeads();
    philomania.presentModal('Great Job!', 'Next round in...', true);
};

philomania.presentModal = function(title, body, startCountdown, subTitle) {
    philomania.modal.style.display = 'block';
    philomania.modalTitle.innerHTML = title;
    philomania.modalBody.innerHTML = body;
    addClass(philomania.modal, 'big-pop-up');
    setTimeout(function() {
        removeClass(philomania.modal, 'big-pop-up');
    }, 1000);

    if (startCountdown) {
        var secondsRemaining = 3;
        philomania.modalCountdown.style.display = 'block';
        philomania.modalCountdown.innerHTML = secondsRemaining;
        var countdownTimer = setInterval(function() {
            secondsRemaining -= 1;
            philomania.modalCountdown.innerHTML = secondsRemaining;
            if (secondsRemaining <= 0) {
                window.clearInterval(countdownTimer);
                philomania.dismissModal();
                philomania.startGameLoop();
            }
        }, 1000);
    }

    if (subTitle) {
        philomania.modalSubTitle.innerHTML = subTitle;
    }
};

philomania.dismissModal = function() {
    philomania.modal.style.display = 'none';
    philomania.modalTitle.innerHTML = '';
    philomania.modalSubTitle.innerHTML = '';
    philomania.modalBody.innerHTML = '';
    removeClass(philomania.modalBody, 'long-text');
    philomania.modalCountdown.innerHTML = '';
    philomania.modalCountdown.style.display = 'none';
    philomania.modalActions.style.display = 'none';
};

philomania.collisionDetected = function(denchHead) {
    if (philomania.philHead.isInvincible) {
        //console.log(`${denchHead.name} has collided with phil but phil is invincible!`);
        return;
    }

    if (philomania.philHead.hp <= 0) {
        //console.log(`${denchHead.name} has collided with phil but phil is already DEAD!`);
        return;
    }

    // Set brief invincibility period
    philomania.philHead.isInvincible = true;
    denchHead.isInvincible = true;
    denchHead.sound.play();
    addClass(philomania.philHead.element, 'invincible');
    addClass(denchHead.element, 'invincible');
    setTimeout(function() {
        philomania.philHead.isInvincible = false;
        removeClass(philomania.philHead.element, 'invincible');
        removeClass(denchHead.element, 'invincible');
    }, philomania.invincibleTimeMs);

    // Subtract HP
    philomania.philHead.hp -= philomania.hitStrengthHP;
    philomania.philHead.hpBar.value = philomania.philHead.hp;
    //console.log(`${denchHead.name} has collided with phil! Current HP: ${philomania.philHead.hp}`);

    denchHead.hp -= philomania.hitStrengthHP;
    denchHead.hpBar.value = denchHead.hp;

    // Check for death
    if (denchHead.hp <= 0) {
        //console.log(`${denchHead.name} is DEAD`);
        denchHead.deinit();
    }
    if (philomania.philHead.hp <= 0) {
        // Phil's DEAD
        //console.log(`${denchHead.name} KILLED phil`);
        philomania.gameOver();
        return;
    }

    denchHead.element.style.transition = '100ms';
    denchHead.element.style.transform = 'scale(1.5)';
    setTimeout(function() {
        denchHead.element.style.transform = 'scale(1)';
    }, 150);
};

philomania.gameOver = function() {
    //console.log('philomania.gameOver()');
    philomania.stopGameLoop();
    philomania.presentModal('Game Over!', 'The boy Phil was captured by the evil Dame\'s army.<br><br>Reload the page to try again.', false);
    addClass(philomania.philHead.element, 'game-over-phil-zoom');
    var mp3Url = `${philomania.baseS3Url}/audio/tim_allen_grunt.mp3`;
    new Audio(mp3Url).play();
};

philomania.updatePoints = function() {
    //console.log('philomania.updatePoints()');
    philomania.currentPoints += philomania.numPointsAwarded;
    philomania.pointsLabel.innerHTML = philomania.currentPoints;
};

// Utility functions
philomania.getDenchHeadFromEvent = function(event) {
    var headIndex = event.target.getAttribute('index');
    return philomania.denchHeads[headIndex];
};

philomania.regenerateDenchHeadImgList = function() {
    //console.log('philomania.regenerateDenchHeadImgList()');
    philomania.denchHeadImgs = [];
    for (var i=1; i<philomania.numDenchHeadImgs; i++) {
        var nextDenchHeadImgUrl = `${philomania.baseS3Url}/img/dench_head_${i}.png`;
        philomania.denchHeadImgs.push(nextDenchHeadImgUrl);
    }
    shuffle(philomania.denchHeadImgs);
};