var portfolio = {
    'initialLoad'           : true,
    'baseS3Url'             : '',
    'projectsPerPage'       : 0,
    'projects'              : [],
    'colorIndex'            : 0,
    'colorChangeInterval'   : 10000,  // 10 seconds,
    'numBalls'              : 50,
    'projectsWrapper'       : document.getElementsByClassName('projects-wrapper')[0],
    'projectWrappers'       : document.getElementsByClassName('project-wrapper'),
    'bigName'               : document.getElementsByClassName('big-name')[0],
    'bigCallToAction'       : document.getElementsByClassName('big-call-to-action')[0],
    'cubeGrid'              : document.getElementsByClassName('cube-grid')[0],
    'ballContainer'         : document.getElementsByClassName('ball-container')[0],
    'moreProjectsBtn'       : document.getElementById('more-projects-btn'),
    'imgAnimationClass'     : 'pop-up',
    'oldProjectsUrl'        : 'http://old.kershner.org/projects',
    'colors'                : [
        ['purple', '#8c53c6'],
        ['pink', '#F2006D'],
        ['orange', '#FF613A'],
        ['green', '#04E762'],
        ['blue', '#0079F2'],
        ['black', '#202020']
    ]
};

portfolio.init = function() {
    var intViewportWidth = window.innerWidth;
    if (intViewportWidth < 500) {
        portfolio.numBalls = 10;
    } else if (intViewportWidth < 700) {
        portfolio.numBalls = 20;
    } else if (intViewportWidth < 900) {
        portfolio.numBalls = 30;
    }

    portfolio.deferImages();
    portfolio.rotateColors();
    portfolio.scrollEvents();
};

portfolio.scrollEvents = function() {
    window.addEventListener('scroll', function(e) {
        addClass(portfolio.cubeGrid, 'hidden');
        if (!window.scrollY > (portfolio.cubeGrid.offsetTop + portfolio.cubeGrid.offsetHeight)) {
            removeClass(portfolio.cubeGrid, 'hidden');
        }
    });
};

portfolio.deferImages = function() {
    var images = document.getElementsByTagName('img');
    for (var i=0; i<images.length; i++) {
        if (images[i].getAttribute('data-src')) {
            images[i].setAttribute('src', images[i].getAttribute('data-src'));
        }
    }
    portfolio.removeImgAnimationClass();
};

portfolio.removeImgAnimationClass = function() {
    setTimeout(function() {
        var images = document.getElementsByTagName('img');
        for (var i=0; i<images.length; i++) {
            removeClass(images[i], portfolio.imgAnimationClass);
        }
    }, 1000);
};

portfolio.rotateColors = function() {
    shuffle(portfolio.colors);
    portfolio.generateBalls();
    portfolio.changeColors();

    // Main color change loop
    setInterval(function() {
        portfolio.changeColors();
    }, portfolio.colorChangeInterval);
};

portfolio.generateBalls = function() {
    const balls = [];
    for (let i=0;i<portfolio.numBalls;i++) {
        let ball = document.createElement('div');
        ball.classList.add('ball');
        ball.classList.add('dynamic-color');
        ball.style.left = `${Math.floor(Math.random() * 100)}vw`;
        ball.style.top = `${Math.floor(Math.random() * 100)}vh`;
        ball.style.transform = `scale(${Math.random()})`;
        ball.style.width = `${randomIntFromInterval(0, 7)}em`;
        ball.style.height = ball.style.width;

        balls.push(ball);
        portfolio.ballContainer.append(ball);
    }

    // Keyframes
    balls.forEach((el, i, ra) => {
        let to = {
            x: Math.random() * (i % 2 === 0 ? -11 : 11),
            y: Math.random() * 12
        };

        let anim = el.animate(
            [
                { transform: 'translate(0, 0)' },
                { transform: `translate(${to.x}rem, ${to.y}rem)` }
            ],
            {
                duration: (Math.random() + 1) * 2000, // random duration
                direction: 'alternate',
                fill: 'both',
                iterations: Infinity,
                easing: 'ease-in-out'
            }
        );
    });
};

portfolio.cubeClick = function() {
    portfolio.cubeGrid.onclick = function() {
        portfolio.projectsWrapper.scrollIntoView();
    }
};

portfolio.moreProjectsClickEvent = function() {
    portfolio.projectWrappers = document.getElementsByClassName('project-wrapper');
    portfolio.addProjects(portfolio.projectWrappers.length);
};

portfolio.addProjects = function(startingIndex) {
    for (var i=0; i<portfolio.projectsPerPage; i++) {
        var newIndex = startingIndex += i;
        portfolio.addProject(newIndex);
    }
};

portfolio.addProject = function(projectIndex) {
    var totalProjects = portfolio.projects.length,
        numProjectWrappers = portfolio.projectWrappers.length,
        project = portfolio.projects[projectIndex];

    removeClass(portfolio.moreProjectsBtn, 'hidden');

    if (numProjectWrappers < totalProjects) {
        portfolio.projectsWrapper.innerHTML += portfolio.getNewProjectHtml(project);
        portfolio.deferImages();
    }

    if (numProjectWrappers === totalProjects - 1) {
        portfolio.moreProjectsBtn.innerHTML = 'Old Site';
        portfolio.moreProjectsBtn.removeEventListener('click', portfolio.moreProjectsClickEvent);
        portfolio.moreProjectsBtn.addEventListener('click', function() {
            window.open(portfolio.oldProjectsUrl, '_blank');
        });
        return false;
    }
};

portfolio.getNewProjectHtml = function(project) {
    var currentColor = portfolio.colors[portfolio.colorIndex][0],
        firstProjectId = project.fields.position === 1 ? 'first-project' : '',
        animationClass = project.fields.position < 3 ? '' : portfolio.imgAnimationClass,
        firstImgClass = project.fields.image_1 === '' ? 'hidden' : '',
        secondImgClass = project.fields.image_2 === '' ? 'hidden' : '',
        thirdImgClass = project.fields.image_3 === '' ? 'hidden' : '';

    var html =  `
                <div id="${firstProjectId}" class="project-wrapper ${project.fields.image_orientation}" data-position="${project.fields.position}">
                    <div class="left-content">
                        <div class="project-icon">
                            <img src="" class="${animationClass}" data-src="${portfolio.baseS3Url}/${project.fields.icon}">
                        </div>

                        <div class="project-title">${project.fields.title}</div>
                        <div class="project-blurb">${project.fields.blurb}</div>

                        <hr align="left" class="dynamic-color ${currentColor}">

                        <div class="project-info"><div class="project-info-title">Technologies:</div>
                            <div class="project-info-value">${project.fields.technologies}</div>
                        </div>
                        `;

    var moreInfoHtml = `<div class="project-info">
                            <div class="project-info-title">More:</div>
                            <div class="project-info-value">${project.fields.extra_notes}</div>
                        </div>`;
    if (project.fields.extra_notes !== '') {
        html += moreInfoHtml;
    }

    html += `<a href="${project.fields.site_url}" target="_blank">
                <div class="project-link-btn dynamic-color ${currentColor}">Visit Site →</div>
            </a>
        </div>

        <div class="right-content">
            <div class="project-img-1 ${firstImgClass}"><img class="${animationClass}" src="" data-src="${portfolio.baseS3Url}/${project.fields.image_1}"></div>
            <div class="project-img-2 ${secondImgClass}"><img class="${animationClass}" src="" data-src="${portfolio.baseS3Url}/${project.fields.image_2}"></div>
            <div class="project-img-3 ${thirdImgClass}"><img class="${animationClass}" src="" data-src="${portfolio.baseS3Url}/${project.fields.image_3}"></div>
        </div>
    </div>
    `;
    return html;
};

portfolio.changeColors = function() {
    var dynamicElements = document.getElementsByClassName('dynamic-color'),
        currentColor = portfolio.colors[portfolio.colorIndex];

    portfolio.colorIndex += 1;
    if (portfolio.colorIndex === portfolio.colors.length) {
        portfolio.colorIndex = 0;
    }

    for (var i=0; i<dynamicElements.length; i++) {
        var dynamicElement = dynamicElements[i];
        addNewColorClass(dynamicElement);
    }

    function addNewColorClass(el) {
        removeClass(el, currentColor[0]);
        addClass(el, portfolio.colors[portfolio.colorIndex][0]);
    }
};