$(function() {

  var initImportJobForm2 = function() {
    var $form = $('#jobfileupload');
    var jobType;

    $("#job_job_type_", $form).change(function() {

      if ($(this).val() === "") {
        $("#job_form_messages", $form)
          .empty()
        //
      } else if ($(this).val() === "report_job") {
        $("#job_form_messages", $form)
          .empty()
          .html(AS.renderTemplate("template_report_instructions"));
        // we disable to form...
        $('.form-actions .btn-primary').addClass('disabled'); 
        $("#noImportTypeSelected", $form).hide();
        $("#job_type_fields", $form)
          .empty()
          .html(AS.renderTemplate("template_report_job"));
        $(".linker:not(.initialised)").linker();
        $(document).triggerHandler("subrecordcreated.aspace", ["date", $form]); 
        $('.select-record', $form).on("click", function(event) { 
          $('.accordion-toggle').click();
          $('.form-actions .btn-primary').removeClass('disabled'); 
          event.preventDefault(); 
          var report = $(this).data('report');
          var $listing = $(this).parent();
          $(this).siblings(".selected-message").removeClass("hide")
          $(this).addClass("hide")
          $listing.removeClass('alert-info').addClass('alert-success'); 
          $listing.parent().siblings('.report-listing').fadeOut('slow', function() { $(this).remove(); });
        });
      
      
      } else if ($(this).val() === "batch_export_job") {

        $("#job_form_messages", $form)
          .empty()
        $("#noImportTypeSelected", $form).hide();
        $("#job_type_fields", $form)
          .empty()
          .html(AS.renderTemplate("template_batch_export_job", {id_path: "batch_export_job", path: "batch_export_job"}));
        $(".linker:not(.initialised)").linker();

      }else if ($(this).val() === "print_to_pdf_job") {

        $("#job_form_messages", $form)
          .empty()
        $("#noImportTypeSelected", $form).hide();
        $("#job_type_fields", $form)
          .empty()
          .html(AS.renderTemplate("template_print_to_pdf_job", {id_path: "print_to_pdf_job", path: "print_to_pdf_job"}));
        $(".linker:not(.initialised)").linker();

      } else if ($(this).val() === "find_and_replace_job") {
        $("#noImportTypeSelected", $form).hide();
        $("#job_form_messages", $form)
          .empty()
          .html(AS.renderTemplate("template_find_and_replace_warning"));
        $("#job_type_fields", $form)
          .empty()
          .html(AS.renderTemplate("template_find_and_replace_job", {id_path: "find_and_replace_job", path: "find_and_replace_job"}));

        // init findAndReplaceForm
        var $selectRecordType = $("#find_and_replace_job_record_type_");
        var $selectProperty = $("#find_and_replace_job_property_");

        $(".linker:not(.initialised)").linker();
        $selectRecordType.attr('disabled', 'disabled');
        $selectProperty.attr('disabled', 'disabled');

        $("#find_and_replace_job_ref_").change(function() {
          var resourceUri = $(this).val();
          if (resourceUri.length) {
            var id = /\d+$/.exec(resourceUri)[0]
            $.ajax({
              url: "/resources/" + id + "/models_in_graph",
              success: function(typeList) {
                var oldVal = $selectRecordType.val();
                $selectRecordType.empty();
                $selectRecordType.append($('<option>', {selected: true, disabled: true})
                  .text(" -- select a record type --"));
                $.each(typeList, function(index, valAndText) {
                  var opts = { value: valAndText[0]};
                  if (oldVal === valAndText[0])
                    opts.selected = true;

                  $selectRecordType.append($('<option>', opts)
                                           .text(valAndText[1]));
                });
                $selectRecordType.removeAttr('disabled');
                if (oldVal != $selectRecordType.val())
                  $selectRecordType.triggerHandler('change');
              }
            });

          }
        });

        $selectRecordType.change(function() {
          var recordType = $(this).val();
          $.ajax({
            url: "/schema/" + recordType + "/properties?type=string&editable=true",
            success : function(propertyList) {
              $selectProperty.empty();

              $.each(propertyList, function(index, valAndText) {
                $selectProperty
                  .append($('<option>', { value: valAndText[0] })
                          .text(valAndText[1]));
              });

              $selectProperty.removeAttr('disabled');
            }
          });
        });

      } else if ($(this).val() === "import_job") {
        // $("#noImportTypeSelected", $form).hide();
        // $("#noImportTypeSelected", $form).show();
        // $("#job_filenames_", $form).hide();

        $("#job_type_fields", $form)
            .empty()
            .html(AS.renderTemplate("template_import_job", {id_path: "import_job", path: "import_job"}))
            .slideDown();

        initFileUploadSection();


        $("#job_import_type_", $form).change(function() {
          if ($(this).val() === "") {
            $("#noImportTypeSelected", $form).show();
            $("#job_filenames_", $form).hide();

          } else {
            $("#noImportTypeSelected", $form).hide();
            $("#job_filenames_", $form)
              .empty()
              .append(AS.renderTemplate("template_fileupload"))
              .slideDown();


            initFileUploadSection();
          }
        });
        $("#job_import_type_", $form).trigger("change");

      }
    });

    $("#job_job_type_", $form).trigger("change");

    var handleError = function(errorHTML) {

      $(".job-create-form-wrapper").replaceWith(errorHTML);
      initImportJobForm2();
    };
	var $progress = $("#uploadProgress", $form)
    var $progressBar = $(".bar", $progress)

    $form.ajaxForm({
      type: "POST",
      beforeSubmit: function(arr, $form, options) {
        $(".btn, a, :input", $form).attr("disabled", "disabled").addClass("disabled");
        $progress.show();

        jobType = $('#job_job_type_', $form).val();

        if (jobType === 'find_and_replace_job') {
          for (var i=0; i < arr.length; i++) {

            // : ( wish I knew how to make linker do this
            if (arr[i].name === "find_and_replace_job[ref]") {
              arr[i].name = "find_and_replace_job[base_record_uri]";
            }

          }

        } else if ( jobType == 'batch_export_job' ) {
          // yep. copying this as well. no crazy about this
          for (var i=0; i < arr.length; i++) {
            if (arr[i].name === "batch_export_job[ref]") {
                arr[i].name = "batch_export_job[source]";
              }
          }
        }  else if ( jobType == 'print_to_pdf_job' ) {
          // yep. copying this as well. no crazy about this
          for (var i=0; i < arr.length; i++) {
            if (arr[i].name === "print_to_pdf_job[ref]") {
                arr[i].name = "print_to_pdf_job[source]";
              }
          }
        } else if (jobType === 'import_job') {
          console.log("ATTACH");
          $(".import-file.file-attached").each(function() {
            var $input = $(this);
            console.log($input);
            arr.push({
              name: "files[]",
              type: "file",
              value: $input.data("file")
            });
          });
        }
      },
      uploadProgress: function(event, position, total, percentComplete) {
        var percentVal = percentComplete + '%';
        $progressBar.width(percentVal)
      },
      success: function(json, status, xhr) {
        var uri_to_resolve;

        if (typeof json === "string") {
          // In IE8 (older browsers), AjaxForm will use an iframe to deliver this POST.
          // When using an iframe it cannot handle JSON as a response type... so let us
          // grab the HTML string returned and parse it.
          var $responseFromIFrame = $(json);

          if ($responseFromIFrame.is("textarea")) {
            if ($responseFromIFrame.data("type") === "html") {
              // it must of errored
              return handleError($responseFromIFrame.val());
            } else if ($responseFromIFrame.data("type") === "json") {
                uri_to_resolve = JSON.parse($responseFromIFrame.val()).uri;
            } else {
              throw "jobs.crud: textarea.data-type not currently support - " + $responseFromIFrame.data("type");
            }
          } else {
            throw "jobs.crud: the response text should be wrapped in a textarea for the plugin AjaxForm support";
          }
        } else {
          uri_to_resolve = json.uri;
        }

        var percentVal = '100%';
        $progressBar.width(percentVal)
        $progress.removeClass("active").removeClass("progress-striped");
        $progressBar.addClass("bar-success");
        $("#successMessage").show();

        location.href = APP_PATH + "resolve/readonly?uri="+uri_to_resolve;
      },
      error: function(xhr) {
        handleError(xhr.responseText);
      }
    });
  };
  

  initImportJobForm2();
});