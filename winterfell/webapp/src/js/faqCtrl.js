var app = angular.module('vetafiApp');

app.filter('unsafe', function($sce) {
  return $sce.trustAsHtml; }
);

app.controller('faqCtrl', ['$scope', function($scope) {
  $scope.sections = [
    {
      title: "How does Vetafi work?",
      content: "Vetafi helps U.S. Veterans file health benefit claims to the U.S. Department of Veteran Affairs. We ask you easy-to-answer questions about your military background and life situation and help you fill in all the correct forms. Your answers tell us how else we can help you and what other information you can include to get the best possible benefits.",
      tags: ['health', 'claim', 'for me']
    },
    {
      title: "Who is Vetafi for?",
      content: "Vetafi mainly helps to serve the U.S. Veterans and Servicemember community. Our main objective is to provide an easy to use tool to help members complete and submit benefit claims so they may receive the best possible benefits.",
      tags: ['veteran', 'veterans', 'service', 'member', 'user', 'audience']
    },
    {
      title: "How much is it to use Vetafi?",
      content: "Vetafi is completely free!",
      tags: ['price', 'cost', 'dollars', 'money']
    },
    {
      title: "What is a VA claim?",
      html: "A claim is a set of completed forms and medical records you may send to the VA to receive compensation, pension, and survivor benefits for you and your family. You may view more detailed information about VA benefits claims <a href='http://www.benefits.va.gov/COMPENSATION/fdc.asp'>here</a>.",
      tags: []
    },
    {
      title: "How does a claim get processed?",
      html: "When the U.S. Department of Veteran Affairs receives your claim, they will review the completed forms and medical records you've submitted. Representatives will then review and cross-check with their records to reach a decision. Once the decision is approved by a committee, they will send you mail with next steps. You may view more detailed information about how claims are processed <a href='http://www.benefits.va.gov/compensation/process.asp'>here</a>.",
      tags: ['Veteran Affairs']
    },
    {
      title: "What is an Intent to File form?",
      content: "Form VA 21-0966 (Intent to File) serves to notify the VA of your intent to file for benefits. Even if your claim fails to process, your benefits effective date will still be the date the VA receives this form.",
      tags: []
    },
    {
      title: "What is an Effective Date?",
      html: "<p>An Effective Date determines when benefits start to apply for a member. This Effective Date is determined based on when the VA receives your claim and how long it takes to finish processing it. An Intent to File form helps you secure your Effective Date on the date the VA receives that form - even if you have not completed your claim. You may view more detailed information about how claims are processed <a href='http://www.benefits.va.gov/compensation/effective_dates.asp'>here</a>.</p>",
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
      title: "I've submitted a claim, now what?",
      html: "From here, all you have to do is wait and check the mail! Once the U.S. Department of Veteran Affairs is finished processing your claim, they will send you a benefit package in the mail. In the mean time, you may view your submitted claims on Vetafi <a href='#/app/profile/claims'>here</a>.",
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
