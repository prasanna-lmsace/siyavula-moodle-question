define(["jquery", "core/ajax"], function ($, Ajax) {
  return {
    init: function (
      baseurl,
      token,
      external_token,
      activityid,
      responseid,
      idsq,
      currenturl,
      next_id,
      $siyavula_activity_id
    ) {
      $(document).ready(function () {
        // Expose showHideSolution to global window object
        window.show_hide_solution = showHideSolution;

        // Initialise MathJax typesetting
        var nodes = Y.all(".latex-math");
        Y.fire(M.core.event.FILTER_CONTENT_UPDATED, { nodes: nodes });

        $(".question-content").on("click", function (e) {
          const response = e.currentTarget.dataset.response;
          const targetid = e.currentTarget.id;

          if (
            e.target.className ===
            "sv-button sv-button--primary check-answer-button"
          ) {
            e.preventDefault();

            // Get all Siyavula inputs that have not been marked "readonly"
            var formData = $(".response-query-input")
              .not('[name*="|readonly"]')
              .serialize();

            var submitresponse = Ajax.call([
              {
                methodname: "filter_siyavula_submit_answers_siyavula",
                args: {
                  baseurl: baseurl,
                  token: token,
                  external_token: external_token,
                  activityid: targetid,
                  responseid: response,
                  data: formData,
                },
              },
            ]);

            submitresponse[0]
              .done(function (response) {
                var responseData = JSON.parse(response.response);
                var html = responseData.response.question_html;
                // Replace question HTML with marked HTML returned from the API
                $(".question-content").html(html);

                const labelSolution = $(
                  ".question-content #show-hide-solution"
                )[0];
                const key = 0; // Because in quiz is only one response solution

                var is_correct = true;
                const rsElement = labelSolution.nextSibling; // Response information
                const identificador = `${rsElement.id}-${key}`;
                rsElement.classList.add(identificador);
                if (rsElement.id == "correct-solution") {
                  is_correct = true;
                } else {
                  is_correct = false;
                }

                // Hide nav buttons (Try exercise again/Go to next exercise)
                $("#nav-buttons").css("display", "none");

                // Typeset new HTML content
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
              })
              .fail(function (ex) {
                console.log(ex);
              });
          }
        });
      });

      function showHideSolution(button) {
        const $button = jQuery(button);

        // Toggle solution visibility
        $button.parent().next().slideToggle("slow");

        // Toggle button text
        const previousValue = $button.attr("value");
        const nextValue = $button.attr("data-alt-value");
        $button.attr("value", nextValue).attr("data-alt-value", previousValue);
      }
    },
  };
});
