var app = angular.module('vetafiApp');
app.controller('tosCtrl', ['$scope', '$location', 'claimService',
  function($scope, $location, claimService) {
    $scope.atTosPage = $location.path() == '/app/tos';
    $scope.accept = false;

    $scope.onAccept = function() {
      console.log($scope);
      if ($scope.accept) {
        claimService.acceptTos(true);
        if (typeof $scope.$close !== 'undefined') {
          $scope.$close(true);
        }
      } else {
        $('.vfi-error-msg').text('You must check the checkbox above to agree and continue.');
      }
    };

    $scope.onDecline = function() {
      console.log($scope);
      $scope.$close();
      $location.path('/');
    };

    $scope.termsSections = [
      {
        header: "General Terms and Conditions",
        paragraphs: [
          "Be sure to read the Terms of Service below, as they cover the terms and conditions that apply to your use of Vetafi.org (the \"Website,\" or \"Site\").",
          "By accessing and using this Site, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services, which may be posted and modified from time to time. All such guidelines or rules are hereby incorporated by reference into the Terms of Service.",
          "In consideration of use of the Site, you agree to: (a) provide true, accurate, current and complete information about yourself as prompted by the registration page and (b) to maintain and update this information to keep it true, accurate, current and complete. If any information provided by you is untrue, inaccurate, not current or incomplete, Vetafi has the right to terminate your account and refuse any and all current or future use of the Site. You agree not to resell or transfer the Site or use of or access to the Site.",
          "You acknowledge and agree that you must: (a) provide for your own access to the World Wide Web and pay any service fees associated with such access, and (b) provide all equipment necessary for you to make such connection to the World Wide Web, including a computer and modem or other access device.",
          "By using the Vetafi.org web site, including any applets, software, and content contained therein, you agree that use of the Site is entirely at your own risk. THE SITE IS PROVIDED \"AS IS,\" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION, ANY WARRANTY FOR INFORMATION, DATA, SERVICES, UNINTERRUPTED ACCESS, OR PRODUCTS PROVIDED THROUGH OR IN CONNECTION WITH THE SITE. SPECIFICALLY, Vetafi DISCLAIMS ANY AND ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO: (1) ANY WARRANTIES CONCERNING THE AVAILABILITY, ACCURACY, USEFULNESS, OR CONTENT OF INFORMATION, PRODUCTS OR SERVICES AND (2) ANY WARRANTIES OF TITLE, WARRANTY OF NON-INFRINGEMENT, WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. THIS DISCLAIMER OF LIABILITY APPLIES TO ANY DAMAGES OR INJURY CAUSED BY ANY FAILURE OF PERFORMANCE, ERROR, OMISSION, INTERRUPTION, DELETION, DEFECT, DELAY IN OPERATION OR TRANSMISSION, COMPUTER VIRUS, COMMUNICATION LINE FAILURE, THEFT OR DESTRUCTION OR UNAUTHORIZED ACCESS TO, ALTERATION OF, OR USE OF RECORD, WHETHER FOR BREACH OF CONTRACT, TORTUOUS BEHAVIOR, NEGLIGENCE, OR UNDER ANY OTHER CAUSE OF ACTION.",
          "NEITHER VETAFI NOR ANY OF ITS EMPLOYEES, AGENTS, SUCCESSORS, ASSIGNS, AFFILIATES, WEBSITE CO-BRANDING PROVIDERS OR CONTENT OR SERVICE PROVIDERS SHALL BE LIABLE TO YOU OR OTHER THIRD PARTY FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF USE OF SERVICE OR INABILITY TO GAIN ACCESS TO OR USE THE SERVICE OR OUT OF ANY BREACH OF ANY WARRANTY. BECAUSE SOME STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, THE ABOVE LIMITATION MAY NOT APPLY TO YOU. IN SUCH STATES, THE RESPECTIVE LIABILITY OF Vetafi, ITS EMPLOYEES, AGENTS, SUCCESSORS, ASSIGNS, AFFILIATES, WEBSITE CO-BRANDING PROVIDERS AND CONTENT OR SERVICE PROVIDERS RESPECTIVE LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED BY SUCH STATE LAW.",
          "Vetafi reserves the right to change any information on this Website including but not limited to revising and/or deleting features or other information without prior notice. Clicking on certain links within this Website might take you to other web sites for which Vetafi assumes no responsibility of any kind for the content, availability or otherwise. The content presented at this Site may vary depending upon your browser limitations.",
          "Vetafi has no obligation to monitor the Site. However, you acknowledge and agree that Vetafi has the right to monitor the Site electronically from time to time and to disclose any information as necessary or appropriate to satisfy any law, regulation or other governmental request, to operate the Site properly, or to protect itself or its customers. Vetafi will not intentionally monitor or disclose any private electronic-mail message unless required by law. Vetafi reserves the right to refuse to post or to remove any information or materials, in whole or in part, that, in its sole discretion, are unacceptable, undesirable, inappropriate or in violation of these Terms of Service.",
          "Unless otherwise indicated for a particular communication, any communications or material of any kind that you e-mail, post or otherwise transmit through this Website, including data, questions, comments or suggestions (\"your Communications\") will be treated as non-confidential and nonproprietary. In addition, Vetafi is free to use any ideas, concepts, know-how or techniques contained in your Communications for any purpose including, but not limited to, developing and marketing products using such information without compensation to you."
        ]
      },
      {
        header: "User Conduct. While using this Site, you may not:",
        paragraphs: [
          "1. restrict or inhibit any other user from using and enjoying the Site; or",
          "2. post or transmit any unlawful, fraudulent, libelous, defamatory, obscene, pornographic, profane, threatening, abusive, hateful, offensive, or otherwise objectionable information of any kind, including without limitation any transmissions constituting or encouraging conduct that would constitute a criminal offense, give rise to civil liability, or otherwise violate any local, state, national or foreign law, including without limitation the U.S. export control laws and regulations; or",
          "3. post or transmit any advertisements, solicitations, chain letters, pyramid schemes, investment opportunities or schemes or other unsolicited commercial communication (except as otherwise expressly permitted by Vetafi) or engage in spamming or flooding; or",
          "4. post or transmit any information or software which contains a virus, trojan horse, worm or other harmful component; or",
          "5. post, publish, transmit, reproduce, distribute or in any way exploit any information, software or other material obtained through the Site for commercial purposes (other than as expressly permitted by the provider of such information, software or other material); or"
        ]
      },
      {
        header: "Failure to Comply With Terms and Conditions and Termination.",
        paragraphs: [
          "You acknowledge and agree that Vetafi may terminate your password or account or deny you access to all or part of the Site without prior notice if you engage in any conduct or activities that Vetafi in its sole discretion believes violate any of the terms and conditions, violate the rights of Vetafi, or is otherwise inappropriate for continued access.",
          "You acknowledge and agree that Vetafi may in its sole discretion deny you access through Vetafi to any materials stored on the Internet, or to access third party services, merchandise or information on the Internet through Vetafi, and Vetafi shall have no responsibility to notify any third-party providers of services, merchandise or information nor any responsibility for any consequences resulting from lack of notification.",
          "You agree to defend, indemnify and hold Vetafi and its affiliates harmless from any and all claims, liabilities, costs and expenses, including reasonable attorneys' fees, arising in any way from your use of the Site or the placement or transmission of any message, information, software or other materials through the Site by you or users of your account or related to any violation of these Terms of Service by you or users of your account."
        ]
      },
      {
        header: "Links from and to this Website.",
        paragraphs: [
          "You acknowledge and agree that Vetafi and any of its website co-branding providers have no responsibility for the accuracy or availability of information provided by linked sites. Links to external web sites do not constitute an endorsement by Vetafi or its website co-branding providers of the sponsors of such sites or the content, products, advertising or other materials presented on such sites."
        ]
      },
      {
        header: "Other Information",
        paragraphs: [
          "Vetafi is taking reasonable and appropriate measures, including encryption, to ensure that your personal information is disclosed only to those specified by you. However, the Internet is an open system and we cannot and do not guarantee that the personal information you have entered will not be intercepted by others and decrypted.",
          "The Terms of Service and the relationship between you and Vetafi shall be governed by the laws of the State of California without regard to its conflict of law provisions. You and Vetafi agree to submit to the personal and exclusive jurisdiction of the courts located within the state of California.",
          "The failure of Vetafi to exercise or enforce any right or provision of the Terms of Service shall not constitute a waiver of such right or provision. If any provision of the Terms of Service is found by a court of competent jurisdiction to be invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties' intentions as reflected in the provision, and the other provisions of the Terms of Service remain in full force and effect."
        ]
      }
    ];
  }
]);
