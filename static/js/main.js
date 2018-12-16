var portfolio = {
    'baseS3Url'             : '',
    'getProjectsURL'        : '',
    'projectsPerPage'       : 0,
    'colorIndex'            : 0,
    'colorChangeInterval'   : 10000,  // 10 seconds,
    'projectsWrapper'       : document.getElementsByClassName('projects-wrapper')[0],
    'projectWrappers'       : document.getElementsByClassName('project-wrapper'),
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
    portfolio.deferImages();
    portfolio.rotateColors();
};

portfolio.deferImages = function() {
    var imgDefer = document.getElementsByTagName('img');
    for (var i=0; i<imgDefer.length; i++) {
    if (imgDefer[i].getAttribute('data-src')) {
        imgDefer[i].setAttribute('src', imgDefer[i].getAttribute('data-src'));
        }
    }
};

portfolio.rotateColors = function() {
    var particlesCanvas = 'particles-js-canvas-el';

    shuffle(portfolio.colors);
    portfolio.changeColors();
    setInterval(function() {
        var particlesWrapper = document.getElementsByClassName(particlesCanvas)[0];
        particlesWrapper.addEventListener('animationend', fadeoutCallback);
        addClass(particlesWrapper, 'fade-out');
    }, portfolio.colorChangeInterval);

    function fadeoutCallback() {
        particlesTeardown();
        portfolio.changeColors();

        var particlesWrapper = document.getElementsByClassName(particlesCanvas)[0];
        particlesWrapper.removeEventListener('animationend', self);
        particlesWrapper.addEventListener('animationend', fadeinCallback);
        addClass(particlesWrapper, 'fade-in');
    }

    function fadeinCallback() {
        var particlesWrapper = document.getElementsByClassName(particlesCanvas)[0];
        particlesWrapper.removeEventListener('animationend', self);
        removeClass(particlesWrapper, 'fade-out');
        removeClass(particlesWrapper, 'fade-in');
    }

    function particlesTeardown() {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        window["pJSDom"] = [];
    }
};

portfolio.chevronClick = function() {
    var bigChevron = document.getElementsByClassName('chevron-down')[0];
    bigChevron.onclick = function() {
        document.getElementById('first-project').scrollIntoView();
    }
};

portfolio.moreProjectsBtn = function() {
    var moreProjectsBtn = document.getElementById('more-projects-btn');

    moreProjectsBtn.addEventListener('click', function() {
        portfolio.projectWrappers = document.getElementsByClassName('project-wrapper');

        var projectWrapper = portfolio.projectWrappers[portfolio.projectWrappers.length - 1],
            id = projectWrapper.getAttribute('data-id');

        let data = new FormData();
        data.append('last_project_id', id);

        fetch(portfolio.getProjectsURL, {
          method : 'post',
          body : data,
          credentials : 'same-origin'
        }).then(response => {
            return response.json();
        }).then(function(data) {
            portfolio.addMoreProjects(data);
        });
    });
};

portfolio.addMoreProjects = function(projects) {
    if (!projects.length) {
        addClass(document.getElementById('more-projects-btn'), 'hidden');
        return
    }

    for (var i=0; i<projects.length; i++) {
        var project = projects[i];
        portfolio.projectsWrapper.innerHTML += portfolio.getNewProjectHtml(project);
    }
    portfolio.deferImages();
};

portfolio.getNewProjectHtml = function(project) {
    var currentColor = portfolio.colors[portfolio.colorIndex][0];
    var html =  `
                <div class="project-wrapper" data-id="${project.pk}">
                    <div class="left-content">
                        <div class="project-icon">
                            <img src="" data-src="${portfolio.baseS3Url}/${project.fields.icon}">
                        </div>

                        <div class="project-title">${project.fields.title}</div>
                        <div class="project-blurb">${project.fields.blurb}</div>

                        <hr align="left" class="dynamic-color ${currentColor}">

                        <div class="project-info"><div class="project-info-title">Technologies:</div>
                            <div class="project-info-value">${project.fields.technologies}</div>
                        </div>

                        <div class="project-info">
                            <div class="project-info-title">More:</div>
                            <div class="project-info-value">${project.fields.extra_notes}</div>
                        </div>

                        <a href="${project.fields.site_url}" target="_blank">
                            <div class="project-link-btn dynamic-color ${currentColor}">Visit Site →</div>
                        </a>
                    </div>

                    <div class="right-content">
                        <div class="project-img-1"><img src="" data-src="${portfolio.baseS3Url}/${project.fields.image_1}"></div>
                        <div class="project-img-2"><img src="" data-src="${portfolio.baseS3Url}/${project.fields.image_1}"></div>
                        <div class="project-img-3"><img src="" data-src="${portfolio.baseS3Url}/${project.fields.image_1}"></div>
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

    particlesInit(portfolio.colors[portfolio.colorIndex][1]);
};