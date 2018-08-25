import axios from 'axios';
import serviceConfig from './config';

/**
 * @api {get} /api/v1/thread/:id/ Get steel thread
 * @apiHeader {String} Authorization Authorization: Token AUTH_TOKEN
 * @apiSuccess {Number} id
 * @apiSuccess {String} title
 * @apiSuccess {String} descriptionKey
 * @apiSuccess {String} modulesKey
 * @apiSuccess {String} prerequistesKey
 * @apiSuccess {Number} estimatedTime
 * @apiSuccess {Array} roles
 * @apiSuccess {Array} applications
 * @apiSuccess {Array} modules
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 0,
 *       "title": "Build a REST-based integration",
 *       "descriptionDoc": "thread-0-description.html",
 *       "modulesDoc": "thread-0-modules.html",
 *       "prerequistesDoc": "thread-0-prereq.html",
 *       "estimatedTime": 20,
 *       "roles": ["Operator", "Developer"],
 *       "applications": ["Red Hat OpenShift Application Runtimes", "Eclipse Che", "Fuse Ignite", "EnMasse"],
 *       "modules": [
 *          {
 *            "title": "Build your REST endpoint",
 *            "iframeUrl": "https://developers.redhat.com/",
 *            "steps": [
 *              {
 *                 "iframeUrl": "https://developers.redhat.com/topics/microservices/",
 *                 "stepDoc": "thread-0-module-1-step-1.html",
 *                 "stepDocInfo": "thread-0-module-1-step-1-info.html"
 *              },
 *              {
 *                 "iframeUrl": "https://developers.redhat.com/products/che/overview/",
 *                 "stepDoc": "thread-0-module-1-step-2.html",
 *                 "stepDocInfo": "thread-0-module-1-step-2-info.html"
 *              }
 *            ]
 *          },
 *          {
 *            "title": "Create connections",
 *            "iframeUrl": "https://www.redhat.com/en",
 *            "steps": [
 *              {
 *                 "iframeUrl": "https://www.redhat.com/en",
 *                 "stepDoc": "thread-0-module-2-step-1.html",
 *                 "stepDocInfo": "thread-0-module-2-step-1-info.html"
 *              }
 *            ]
 *          },
 *          {
 *            "title": "Set up messaging",
 *            "iframeUrl": "https://openshift.io/",
 *            "steps": [
 *              {
 *                 "iframeUrl": "https://openshift.io/",
 *                 "stepDoc": "thread-0-module-3-step-1.html"
 *              }
 *            ]
 *          },
 *          {
 *            "title": "Build integration",
 *            "iframeUrl": "https://www.openshift.com/products/online/",
 *            "steps": [
 *              {
 *                 "iframeUrl": "https://www.openshift.com/products/pricing/",
 *                 "stepDoc": "thread-0-module-4-step-1.html",
 *                 "stepDocSuccess": "thread-0-module-4-step-1-success.html"
 *              }
 *            ]
 *          }
 *        ]
 *     }
 * @apiError {String} detail
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "detail": "Authentication credentials were not provided."
 *     }
 */
const getThread = id => {
  // todo: remove me after backend is available in production
  const sample = {
    id: 0,
    title: 'Build a REST-based integration',
    descriptionDoc: 'thread-0-description.html',
    modulesDoc: 'thread-0-modules.html',
    prerequistesDoc: 'thread-0-prereq.html',
    estimatedTime: 20,
    roles: ['Operator', 'Developer'],
    applications: ['Red Hat OpenShift Application Runtimes', 'Eclipse Che', 'Fuse Ignite', 'EnMasse'],
    modules: [
      {
        title: 'Build your REST endpoint',
        iframeUrl: 'https://developers.redhat.com/',
        steps: [
          {
            iframeUrl: 'https://developers.redhat.com/topics/microservices/',
            stepDoc: 'thread-0-module-1-step-1.html',
            stepDocInfo: 'thread-0-module-1-step-1-info.html'
          },
          {
            iframeUrl: 'https://developers.redhat.com/products/che/overview/',
            stepDoc: 'thread-0-module-1-step-2.html',
            stepDocInfo: 'thread-0-module-1-step-2-info.html'
          }
        ]
      },
      {
        title: 'Create connections',
        iframeUrl: 'https://www.redhat.com/en',
        steps: [
          {
            iframeUrl: 'https://www.redhat.com/en',
            stepDoc: 'thread-0-module-2-step-1.html',
            stepDocInfo: 'thread-0-module-2-step-1-info.html'
          }
        ]
      },
      {
        title: 'Set up messaging',
        iframeUrl: 'https://openshift.io/',
        steps: [
          {
            iframeUrl: 'https://openshift.io/',
            stepDoc: 'thread-0-module-3-step-1.html'
          }
        ]
      },
      {
        title: 'Build integration',
        iframeUrl: 'https://www.openshift.com/products/online/',
        steps: [
          {
            iframeUrl: 'https://www.openshift.com/products/pricing/',
            stepDoc: 'thread-0-module-4-step-1.html',
            stepDocSuccess: 'thread-0-module-4-step-1-success.html'
          }
        ]
      }
    ]
  };
  if (process.env.REACT_APP_ENV === 'production') {
    return new Promise(resolve => {
      resolve({ data: sample });
    });
  }
  return axios(
    serviceConfig({
      url: `${process.env.REACT_APP_THREAD_SERVICE}${id}/`
    })
  );
};

export { getThread };
