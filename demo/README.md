# Vetaffi
Vetaffi is a powerful, easy-to-use web-app that improves health claim filing experiences for U.S. veterans.

# We can help you...
- Research and manage your health file claims
    - Learn about your health benefits and entitlements
    - Track the status of your claims, including ones you have already filed. **Never lose your documents again!**
- File your health claims quickly and efficiently 
  - We streamline complex health & military forms into simple questionnaires so they are easy to understand and you don't have to re-fill information.
- Automatically generate VA forms with your information already filled out!

# For researchers,
We use Mixpanel to track metrics regarding how users use the application to help you answer questions regarding health-filing, depression detection, suicide prevention, etc.
 - Every page and question is tracked with metrics so we know whether users fill it out and how long it takes them to. It is our hope that with this data, questionnaires can be modified to be more approachable to users.

# Forms that are currently supported
 - VBA-21-526EZ-ARE (general VA health form)
 - VBA-21-0781-ARE (PTSD)
 - VBA-21-4502-ARE (Mobility disability)
 - Patient Health Questionnaire (PHQ-9)

# Tech stack 
 - AngularJs
 - DropWizard
 - iTextPDF

# Making Vetaffi
Vetaffi was a hackathon project for BayesHack 2016 (hosted by Bayes Impact) by Aaron Hsu and Jeff Quinn. The idea of the project was first inspired by TurboTax, a web application that could take daunting tasks like filing tax-returns and pipeline the process into an easy-to-use questionnaire. Health insurance is extremely complicated, for both civilians and military personnel, so the idea was to apply this simplified User Experience model to filing health claims for veterans.

Whether the user was a veteran, a family/friend, or a VA representative, we wanted the app to be as intuitive and easy to use as possible. When filing health claims, Vetaffi guides you to forms that you only need to know about and recommends you certain paths you could take based on other veterans who have similar experiences. We also save and track your claims history so your documents are always available and you know the status of any ongoing claims that you have sent.

From there, Vetaffi evolved to make form-filling even easier by combining forms together so questions are de-duplicated. With this, users do not have to re-enter information they have already entered and can fill out forms simultaneously! We even let you download an automatically generated VA form with your personal information already filled out.

As a bonus, Mixpanel, a web-based analytics API tool, was integrated with Vetaffi so metrics could be added to track how users used the product. With these data, researchers can use our data models to understand where in the filing process to users drop off. For instance, depression and suicidal detection forms (i.e. PHQ-9) can be difficult for many veterans to complete since they relive their personal traumatic events. Researchers can accordingly modify these questionnaires to be more approachable and instantly deploy them online instead of using forms.

# Future Work
 - Support more VA forms
 - Save a user's progress so when they return to the tool, they can start from where they left off
 - Setup an emailing scheme to get veterans to return to the tool, in case they need to fill out more forms or when their claims have reached a new stage of progression.
 - Machine learning on veteran data. Based on my experiences, it would be helpful to know what form other veterans of similar backgrounds have also filed. We can have a powerful engine that recommends these forms for the user to fill out.
