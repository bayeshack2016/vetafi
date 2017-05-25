var app = angular.module('vetafiApp');

app.filter('unsafe', function($sce) {
  return $sce.trustAsHtml; }
);

app.controller('faqCtrl', ['$scope', function($scope) {
  $scope.sections = [
    {
      title: "How does Vetafi work?",
      content: "It's pretty simple. " +
      "You fill out the questions on our user friendly form, " +
      "and we populate the answers into the official VA paperwork. " +
      "When you're ready to submit, you'll sign the paperwork right here in your browser, " +
      "and we will electronically fax AND mail it to the VA (we do both to make certain " +
      "they receive all your paperwork). We will also mail you a copy for your records.",
      tags: ['health', 'claim', 'for me']
    },
    {
      title: "Who is Vetafi for?",
      content: "Vetafi is for U.S. veterans who wish to apply for pension, " +
      "compensation, or survivor's pension/dependency and indemnity compensation " +
      "(DIC) benefits. Our main objective is to provide an easy to use tool to " +
      "help veterans take the first step in beginning their claim.",
      tags: ['veteran', 'veterans', 'service', 'member', 'user', 'audience']
    },
    {
      title: "How much is it to use Vetafi?",
      content: "Vetafi is completely free!",
      tags: ['price', 'cost', 'dollars', 'money']
    },
    {
      title: "What is a VA claim?",
      html: "A claim is a set of completed forms, statements, medical records, " +
      "and other evidence you have to send to the VA in order to receive compensation, " +
      "pension, or survivor benefits. You may view more detailed information about " +
      "VA benefits claims <a href='http://www.benefits.va.gov/COMPENSATION/fdc.asp'>here</a>.",
      tags: []
    },
    {
      title: "What is an Intent to File form?",
      content: "Form VA 21-0966 (Intent to File) serves to notify the VA of your intent to file for benefits. " +
      "Your benefits effective date will be the date the VA receives this form. " +
      "This allows you to take your time to carefully collect the evidence required to file a successful claim. " +
      "If you submit and your claim is approved, you will receive retroactive benefits back to the date of your Intent to File submission (within 1 year only).",
      tags: []
    },
    {
      title: "What is an Effective Date?",
      html: "<p>An Effective Date is the date when your benefits start to apply. You can view more information <a href='http://www.benefits.va.gov/compensation/effective_dates.asp'>here</a>.</p>",
      tags: []
    },
    {
      title: "How do I start filing for a claim?",
      html: "Vetafi can help you start filing a claim <a href='#/app/claim/start'>here</a>. It will be easy!",
      tags: []
    },
    {
      title: "Why is there only one form to select?",
      html: "Vetafi only supports Form VA 21-0966 at the moment. We will be supporting more forms in the near future! You can see more forms that may be applicable to you <a href='http://www.va.gov/vaforms/'>here</a>.",
      tags: []
    },
    {
      title: "Does Vetafi save my information? Is it safe?",
      html: "Vetafi saves information that you enter so you don't have to enter that information again. Even if you leave this website, you can always come back to finish your uncompleted claim right where you left off! Vetafi will not release or share your personal information to any individual, third-parties, organizations or companies. All information collected is strictly to serve Vetafi's objectives and enhance your experience. You can view our Terms of Service <a href='#/app/tos'>here</a>.",
      tags: []
    },
    {
      title: "I've submitted the Intent to File, now what?",
      html: "Now you need to begin collecting the evidence for your fully developed claim (FDC). Once complete can submit your FDC either by paper or through eBenefits. We do not yet support submitting your FDC itself through Vetafi, but we hope to support this soon.",
      tags: ['process', 'wait', 'long']
    },
    {
      title: "How long does it take for the VA to process my claim?",
      html: "Due to the sheer number of claims to process and limited resources, it can take the U.S. Department of Veteran Affairs several weeks to a few months to finish processing your claim. The wait time usually depends on how complicated the claim is. You can view more information about claim processing time <a href='http://www.benefits.va.gov/compensation/process.asp'>here</a>.",
      tags: ['Veteran Affairs', 'wait']
    }
  ];

  $scope.searchText = '';
  $scope.onSearchChange = function() {
  };
  $scope.cancelSearch = function() {
    $scope.searchText = '';
  };

}]);
