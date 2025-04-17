import { NextRequest, NextResponse } from 'next/server';

// This is the source code for the Surface Tag JavaScript
const tagJsSource = `
(function(window, document) {
  console.log('Surface Analytics tag loading...');
  
  // Surface Analytics main object
  window.SurfaceAnalytics = window.SurfaceAnalytics || {};
  
  // Initialize with the provided tag ID
  const initSurface = function(tagId) {
    console.log('Initializing Surface Analytics with tagId:', tagId);
    const visitorId = generateVisitorId();
    
    window.SurfaceAnalytics = {
      tagId: tagId,
      visitorId: visitorId,
      initialized: true,
      track: function(eventType, metadata = {}) {
        // Always include the tagId in the metadata
        const enrichedMetadata = {
          ...metadata,
          tagId: tagId
        };
        sendEvent(eventType, visitorId, enrichedMetadata);
      }
    };
    
    // Track script initialization event - essential for onboarding detection
    window.SurfaceAnalytics.track('script_initialized', {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Track page view automatically
    window.SurfaceAnalytics.track('page_view', {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer
    });
    
    // Setup listeners for other required events
    setupEventListeners();
    
    console.log('Surface Analytics initialized successfully');
  };
  
  // Generate a unique visitor ID
  const generateVisitorId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Send event data to the API
  const sendEvent = function(eventType, visitorId, metadata) {
    const eventData = {
      type: eventType,
      visitor: visitorId,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending event to Surface Analytics:', eventData);
    
    // Use the server location from which this script was loaded
    const scriptSrc = document.currentScript ? document.currentScript.src : '';
    const serverOrigin = scriptSrc ? new URL(scriptSrc).origin : 'http://localhost:3000';
    
    fetch(serverOrigin + '/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData),
      mode: 'cors',
      credentials: 'omit'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      console.log('Event sent successfully:', eventType);
      return response.json();
    })
    .catch(error => {
      console.error('Error sending event to Surface Analytics:', error.message);
    });
  };
  
  // Set up event listeners for other tracked events
  const setupEventListeners = function() {
    // Track clicks on page elements
    document.addEventListener('click', function(e) {
      if (!e.target) return;
      
      const target = e.target;
      const elementType = target.tagName ? target.tagName.toLowerCase() : 'unknown';
      const elementId = target.id || '';
      const elementClass = target.className || '';
      const elementText = target.textContent ? target.textContent.substring(0, 50) : '';
      
      window.SurfaceAnalytics.track('element_click', {
        elementType: elementType,
        elementId: elementId,
        elementClass: elementClass,
        elementText: elementText,
        url: window.location.href
      });
    });
    
    // Track form submissions and email inputs
    document.addEventListener('submit', function(e) {
      if (!e.target || !(e.target instanceof HTMLFormElement)) return;
      
      const form = e.target;
      const formId = form.id || 'unknown_form';
      
      // Check for email fields in the form
      const emailFields = form.querySelectorAll('input[type="email"]');
      if (emailFields.length > 0) {
        // Track email entered event with masked email value
        emailFields.forEach(field => {
          if (field.value) {
            // Get email and create a masked version (e.g., j***@e***.com)
            const email = field.value;
            const maskedEmail = maskEmail(email);
            
            window.SurfaceAnalytics.track('email_entered', {
              formId: formId,
              fieldId: field.id || 'unknown_field',
              fieldName: field.name || '',
              maskedEmail: maskedEmail,
              url: window.location.href
            });
          }
        });
      }
      
      // Track the form submission
      window.SurfaceAnalytics.track('form_submit', {
        formId: formId,
        formAction: form.action || '',
        url: window.location.href
      });
    });
    
    // Track email input changes
    document.addEventListener('change', function(e) {
      if (!e.target) return;
      
      const target = e.target;
      if (target.tagName === 'INPUT' && target.type === 'email' && target.value) {
        // Get email and create a masked version (e.g., j***@e***.com)
        const email = target.value;
        const maskedEmail = maskEmail(email);
        
        window.SurfaceAnalytics.track('email_entered', {
          fieldId: target.id || 'unknown_field',
          fieldName: target.name || '',
          formId: target.form ? target.form.id || 'unknown_form' : 'no_form',
          maskedEmail: maskedEmail,
          url: window.location.href
        });
      }
    });
  };
  
  // Function to mask/hash email addresses for privacy
  const maskEmail = function(email) {
    if (!email || typeof email !== 'string') return '';
    
    try {
      const parts = email.split('@');
      if (parts.length !== 2) return '***@***.com';
      
      let username = parts[0];
      let domain = parts[1];
      
      // Keep first character of username, mask the rest
      const maskedUsername = username.charAt(0) + '***';
      
      // Keep first character of domain, mask until TLD
      const domainParts = domain.split('.');
      let maskedDomain = '';
      
      if (domainParts.length >= 2) {
        maskedDomain = domainParts[0].charAt(0) + '***.' + domainParts[domainParts.length-1];
      } else {
        maskedDomain = 'd***.com';
      }
      
      return maskedUsername + '@' + maskedDomain;
    } catch (e) {
      console.error('Error masking email:', e);
      return '***@***.com';  // Return fully masked as fallback
    }
  };
  
  // Extract tag ID from URL parameters
  const getTagId = function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
      return urlParams.get('id');
    }
    
    // Check for tag ID in script tag
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].getAttribute('src') || '';
      if (src.includes('tag.js') || src.includes('api/analytics')) {
        try {
          const scriptUrl = new URL(src, window.location.origin);
          const scriptParams = new URLSearchParams(scriptUrl.search);
          if (scriptParams.has('id')) {
            return scriptParams.get('id');
          }
        } catch (e) {
          console.error('Error parsing script URL:', e);
        }
      }
    }
    
    return 'SURFACE-TAG-12345'; // Use the same default as in the onboarding page
  };
  
  // Initialize the tracker
  const tagId = getTagId();
  initSurface(tagId);
  
})(window, document);
`;

// Helper function to set CORS headers
function setCorsHeaders(response: NextResponse) {
  // to fix cross-origin issues
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// to handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  console.log('OPTIONS request received for tag.js endpoint');
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {  
  // tag ID from request if present
  const url = new URL(request.url);
  const tagId = url.searchParams.get('id');
  const response = new NextResponse(tagJsSource, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    }
  });
  
  return setCorsHeaders(response);
} 