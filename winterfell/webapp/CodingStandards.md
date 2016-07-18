# Coding Standards

## Design Practices
Refer to the [U.S. Web Design standards](https://standards.usa.gov/).

### Colors


### Browser Support
The minimum browser versions to support are:
Internet Explorer: 13.0
Firefox: 35.0
Chrome: 18.0
Safari: 9.1
Opera: 15.0

### Make the web-app responsive to the following widths:
- 800px+ (desktop monitor)
- < 800px (laptop)
- < 640px (tablet)
- < 480px (phone)

### Grid Layout
Layouts and elements should be in terms of multiples of 12px.
For example, an element can be 120px wide, and the space between the item below can be 24px.

## Naming Practices

For css class names, add _vfi-_ in front of all class names.
This way, when using third-party frameworks or libraries, class names do not get mixed up.
For instance: Use _.vfi-bar_ instead of just _.bar_ as the class name. 

_.bar_ is a very generic name which could be used by another framework.
With the _vfi-_ addition, it almost guarantees that the class name is for our web app.

