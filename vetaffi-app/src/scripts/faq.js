var app = angular.module('vetaffiApp');

app.controller('faqCtrl', ['$scope', '$mixpanel', function($scope, $mixpanel) {
    $scope.searchText = '';
    $scope.onSearchChange = function() {
        $mixpanel.track("faq_search", {
            query: $scope.searchText
        });
    };

    $(function() {
        $('.search-bar input').focus(function() {
             $('.search-bar').addClass('highlight');
        }).blur(function() {
            $('.search-bar').removeClass('highlight');
        });
    });

    $scope.onClickSubtopic = function(topic) {
        if (topic.show) {
            topic.show = false;
            $mixpanel.track("faq_subtopic", {
                topic: topic.name,
                selected: false,
            });
        } else {
            topic.show = true;
            $mixpanel.track("faq_subtopic", {
                topic: topic.name,
                selected: true,
            });
        }
    };

    $scope.sections = [
        {
            title: 'Applying for Health Care Benefits',
            subtopics: [
                {
                    subtitle: 'How do I start my claim?',
                    name: 'file_claim_start',
                    show: false,
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum"
                },
                {
                    subtitle: 'What benefits am I eligible for?',
                    name: 'eligible_benefits',
                    show: false,
                    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et"
                },
            ]
        },
        {
            title: 'Managing my Claims',
            subtopics: [
                {
                    subtitle: 'View my past claims',
                    name: 'view_past_claims',
                    show: false,
                    content: "beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit"
                }
            ]
        },
    ];

    $mixpanel.track("faq_page_landed", {});
}]);

