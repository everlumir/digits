jQuery(function () {

    var precode;
    var secure_wrap = '<div class="digits-form_tab_wrapper"><div class="digits-form_tab_container"></div></div>';


    var forgotPassChange = 0;
    var dig_reg_wp_elem = jQuery("#dig_reg_wp_elem");
    if (dig_reg_wp_elem.length) {
        dig_reg_wp_elem = dig_reg_wp_elem.closest('form');
        if (!dig_reg_wp_elem.hasClass("dokan-vendor-register")) {

            if (dig_reg_wp_elem.find(".dig_wc_reg_form_end").length === 0) {
                dig_reg_wp_elem.addClass('wp_reg');
                dig_reg_wp_elem.find("#user_login").attr('id', 'user_uname');
                jQuery(".digits_register").removeClass('wp_reg');
            } else {
                dig_reg_wp_elem.find(".dig_wp_bp_fields").remove();
            }
        }
    }

    var dig_login_wp_elem = jQuery("#dig_login_wp_elem");
    if (dig_login_wp_elem.length) {
        if (dig_mdet.login_mobile_accept > 0) {
            dig_login_wp_elem = dig_login_wp_elem.closest('form');

            if (dig_login_wp_elem.find(".loginuname").length === 0) {
                dig_login_wp_elem.addClass('wp_login');
                dig_login_wp_elem.find("input[type='text']").first().attr({'id': 'username', 'nan': 1});
            } else {
                dig_login_wp_elem.find(".dig_bb_wp_otp_field").remove();
            }
        }
    }

    var akCallback = -1;
    var useWhatsApp = 0;

    jQuery("#digit_emailaddress").closest("form").addClass("register");
    jQuery("#wc_code_dig").closest("form").addClass("login");
    jQuery("#digits_wc_code").closest("form").addClass("woocommerce-ResetPassword");

    if (dig_log_obj.dig_dsb == 1) return;

    var loader = jQuery(".dig_load_overlay");
    var tokenCon;

    function checkoutwc_comp() {
        var cfw_login_modal = jQuery('#cfw_login_modal_form');
        if (cfw_login_modal.length > 0) {
            var cfw_username = cfw_login_modal.find('#cfw_login_username_field');
            cfw_username.find('#cfw_login_username').attr({
                'placeholder': dig_mdet.emailormobile,
            }).addClass('digits_mobile_field');
            cfw_username.find('label').text(dig_mdet.emailormobile);

            cfw_login_modal.find('.loginViaContainer button,.digits-form_submit-btn').addClass('cfw-primary-btn');

            var otp_container = cfw_login_modal.find('#dig_wc_log_otp_container');
            if (otp_container.length > 0) {
                otp_container.addClass('col-lg-12 cfw-text-input cfw-input-wrap cfw-label-is-floated');
                otp_container.insertAfter(cfw_username);
            }

            if (dig_mdet.secure_forms) {
                cfw_login_modal.find('#cfw_login_password_field').remove();
                cfw_login_modal.find('#cfw-login-btn').remove();
                cfw_login_modal.find('.cfw-login-modal-navigation').insertAfter(jQuery(cfw_login_modal.find('.digits-form_submit-btn')));

                var last_cfw_submit_index = cfw_username.index() + 1
                cfw_login_modal.children().slice(3, last_cfw_submit_index).wrapAll(secure_wrap);

                cfw_username.find('#cfw_login_username').attr({
                    'id': 'username',
                });
            }


        }
    }

    function merge_billing_field() {
        function dig_wc_merge_field(field_name) {
            var bp_wc = jQuery("#" + field_name);
            if (bp_wc.length > 0) {

                var bp_wc_val = bp_wc.val();
                var countrycode = dig_mdet.uccode.replace('+', '');
                var phone_no = bp_wc_val;
                if (bp_wc.attr('countryCode')) {
                    countrycode = bp_wc.attr('countryCode');
                    countrycode = countrycode.replace('+', '');
                    if(bp_wc.attr('user_phone')) {
                        phone_no = bp_wc.attr('user_phone');
                    }
                } else {
                    var bp_wc_phone = bp_wc_val.replace('+', '');
                    var phone_obj;
                    if(!bp_wc_val.includes('+')) {
                        if (bp_wc.attr('billing_country_code')) {
                            var billingCountryCode = bp_wc.attr('billing_country_code');
                            phone_obj = libphonenumber.parsePhoneNumberFromString('+' + billingCountryCode + bp_wc_phone);
                        }
                    }
                    if (typeof phone_obj == "undefined") {
                        phone_obj = libphonenumber.parsePhoneNumberFromString('+' + bp_wc_phone);
                    }

                    if (typeof phone_obj != "undefined") {
                        countrycode = phone_obj.countryCallingCode;
                        phone_no = phone_obj.nationalNumber;
                    }
                }

                bp_wc.attr({
                    'only-mob': 1,
                    'f-mob': 1,
                    'countryCode': countrycode,
                    'value': phone_no,
                    'mob': 1,
                    "id": 'username',
                    'data-dig-main': field_name,
                }).parent().append('<input type="hidden" name="' + field_name + '" id="' + field_name + '" value="' + bp_wc_val + '" />');

                return true;
            }
            return false;
        }

        var wc_phone_billing_merge = dig_wc_merge_field('billing_phone');
        var wc_phone_shipping_merge = dig_wc_merge_field('shipping_phone');
        if (wc_phone_billing_merge) {
            checkoutwc_comp();
        }
    }

    merge_billing_field();


    function loginuser(response) {
        if (precode == response.code) {
            return false;
        }

        var rememberMe = 0;
        if (jQuery("#rememberme").length) {
            rememberMe = jQuery("#rememberme:checked").length > 0;
        }
        precode = response.code;
        jQuery.ajax({
            type: 'post',
            url: dig_mdet.ajax_url,
            data: {
                action: 'digits_login_user',
                code: response.code,
                csrf: response.state,
                rememberMe: rememberMe,
            },
            success: function (res) {
                if (isJSON(res)) {

                    if (!res.data.code) {
                        res = res;
                    } else {
                        if (res.data.error_msg) {
                            loader.hide();
                            if (res.data.error_type) {
                                showDigMessage(res.data.error_msg, res.data.error_type);
                            } else {
                                showDigErrorMessage(res.data.error_msg);
                            }
                            return;
                        }

                        if (res.redirect) {
                            showDigLoginSuccessMessage();
                            digits_redirect(res.redirect);
                            return;
                        }
                        res = res.code;
                    }
                } else {
                    res = res.trim();
                }

                loader.hide();
                if (res == "1") {

                    if (ihc_loginform == 10)
                        document.location.href = "/";
                    else {

                        showDigLoginSuccessMessage();
                        if (jQuery("#digits_redirect_page").length) {
                            digits_redirect(jQuery("#digits_redirect_page").val());
                        } else digits_redirect(dig_mdet.uri);
                    }

                } else if (res == -1) {
                    showDigNoticeMessage(dig_mdet.pleasesignupbeforelogginin);
                } else if (res == -9) {
                    showDigErrorMessage(dig_mdet.invalidapicredentials);
                } else {
                    showDigErrorMessage(dig_mdet.invalidlogindetails);
                }

            }
        });

        return false;
    }

    function forgotihcCallback(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {

            jQuery("#digits_impu_code").val(response.code);
            jQuery("#digits_impu_csrf").val(response.csrf);

            jQuery("#digits_password_ihc_cont").show().find("input").attr("required", "required");
            jQuery("#digits_cpassword_ihc_cont").show().find("input").attr("required", "required");
            forgotpassihc = 2;


        }
    }

// login callback
    function loginCallback(response) {
        if (response.status === "PARTIALLY_AUTHENTICATED") {

            showDigitsLoader(false);
            loginuser(response);
        } else if (response.status === "NOT_AUTHENTICATED") {
            showDigitsLoader(true);
        } else if (response.status === "BAD_PARAMS") {
            showDigitsLoader(true);
        }

    }

// phone form submission handler
    function smsLogin() {

    }

    function phonenumber(data) {
        var phoneno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
        return !!(data.match(phoneno));
    }

    var reg_email = jQuery("#reg_email");
    var mailsecond = jQuery(".dig_wc_mailsecond");
    var mailSecondLabel = jQuery("#dig_secHolder");
    var secondmailormobile = jQuery("#secondmailormobile");

    var user_login = jQuery("#user_login");

    var otp_field;
    var show_message = true;
    var is_checkout = false;
    var ew = 30;


    jQuery('input[id="account_email"]').each(function (index) {
        jQuery(this).parent().find('label').find('span').remove();
    });


    var dig_sortorder = dig_mdet.dig_sortorder;
    var register = jQuery(".dig_wc_reg_form").closest(".register");
    if (dig_sortorder.length) {
        register.find("#reg_username").closest('.form-row').attr('id', 'dig_cs_username').addClass('dig-custom-field');
        register.find("#reg_password").closest('.form-row').attr('id', 'dig_cs_password').addClass('dig-custom-field');

        if (dig_mdet.mobile_accept > 0) {
            register.find("#reg_email").parent().attr({
                'id': 'dig_cs_mobilenumber',
                'class': 'dig-custom-field woocommerce-FormRow--wide form-row form-row-wide'
            });
        } else {
            register.find("#reg_email").parent().attr({
                'id': 'dig_cs_email',
                'class': 'dig-custom-field woocommerce-FormRow--wide form-row form-row-wide'
            });
        }

        var sortorder = dig_sortorder.split(',');
        var digits_register_inputs = register;


        digits_register_inputs.each(function () {
            jQuery(this).find('.dig-custom-field').sort(function (a, b) {
                var ap = jQuery.inArray(a.id, sortorder);
                var bp = jQuery.inArray(b.id, sortorder);
                return (ap < bp) ? -1 : (ap > bp) ? 1 : 0;
            }).prependTo(jQuery(this));
        });


    }


    var c = jQuery(".ihc-form-create-edit");


    if (c.length && dig_mdet.mobile_accept > 0) {
        /*iump reg*/
        var f = jQuery(".iump-register-form").find("#createuser");
        var i_ccode = dig_mdet.uccode;


        f.find("input[name='phone']").attr({
            "data-dig-main": 1,
            "reg": 2,
            "data-skip-label": 1,
            "id": "username",
            "mob": 1,
            "countryCode": i_ccode,
            "nan": 1,
            "f-mob": 1,
        }).data('type', 2);


        jQuery('<input type="hidden" id="dig_ihc_ea_code" name="code"/><input type="hidden" id="dig_ihc_ea_csrf" name="csrf"/><div id="dig_ihc_mobotp" class="iump-form-line-register iump-form-text" style="display:none;">' +
            '<input value="" id="digits_otp_ihc" name="digit_otp" placeholder="' + dig_mdet.OTP + '" type="text" style="padding-left:10px !important;">')
            .insertBefore(f.find("input[type='submit']").closest('.iump-submit-form'));

    }


    var wcform = jQuery("#wc_dig_reg_form").closest("form");
    var wc_checkout = jQuery(".woocommerce-form-login");
    if (wcform.length) {
        wcform.find('input[type="password"]').closest(".woocommerce-FormRow").remove();
        wcform.find('input[name="login"]').remove();
        wcform.find(".woocommerce-LostPassword").remove();
        wcform.find('#rememberme').closest('label').remove();
        wcform.find("#username").attr('mob', 1);

        if (wc_checkout.length) {
            wc_checkout.find('input[type="password"]').closest('.woocommerce-form-row').remove();
            wc_checkout.find(".form-row-first").removeClass("form-row-first");
            wc_checkout.find(".lost_password").remove();
            wc_checkout.find('#rememberme').closest('label').remove();
            wc_checkout.find('[name="login"]').remove();
            wc_checkout.find("#username").attr('mob', 1);
        }
    }


    var uc = jQuery("#dig_wc_check_page");
    if (uc.length) {
        uc = uc.parent();
        var createAccounts = uc.find(".create-account");
        createAccount = createAccounts.last();
        if (createAccount.length) {
            createAccount.find("#username").attr({'f-mob': 1, 'reg': 1, 'data-dig-mob': 1});
            if (dig_mdet.mobile_accept == 2) {
                createAccount.find("#username").attr({'data-dig-mob': 1, 'data-type': 2});
            }
            var wc_check_dig_fields = jQuery(".wc_check_dig_custfields");
            wc_check_dig_fields.appendTo(createAccount);
            if (createAccounts.length === 1) {
                wc_check_dig_fields.addClass('create-account')
            }
        }
    }
    var dismissLoader = false;
    var dig_billing_password = jQuery("#billing_account_password");


//// Ultimate user
    var um_register = jQuery(".um-register");
    if (um_register.length) {
        um_register.find('.um-field-mobile_number').find('input').attr({
            'id': 'username',
            'nan': '1',
            'f-mob': 1
        }).data('type', 2);
    }
    var um_login = jQuery(".um-login");
    if (um_login.length) {
        if (um_login.find('.um-field-mobile_number').length) {
            um_login.find('.um-field-mobile_number').remove();
            var um_username_field = um_login.find('.um-field-username');
            um_username_field.find('label').attr('for', 'username').text(dig_mdet.emailormobile);
            um_username_field.find('input').attr({'id': 'username', 'nan': 1});
            um_login.find('.ump_digits_otp_container').show();
        }
    }

    var um_forgot = jQuery(".woocommerce-ResetPassword");
    if (um_forgot.length) {
        var um_forgot_uname_field = um_forgot.find('.um-field-username_b');
        if (um_forgot_uname_field.length) {
            um_forgot_uname_field.find('label').attr('for', 'username').text(dig_mdet.emailormobile);
            um_forgot_uname_field.find('input').attr({'id': 'username', 'nan': 1});
            um_forgot.addClass('digits_um_forgotpass');
        }
    }

    var um_forgot_pass = 0;
    jQuery('.digits_um_forgotpass #um-submit-btn').on('click', function () {
        update_time_button = jQuery(this);
        cuForm = jQuery(this).closest('form');
        var uname_field = cuForm.find('#username');
        var ccode_field = cuForm.find('.dig_wc_logincountrycode');
        var uname = uname_field.val();
        var ccode = ccode_field.val();
        if (isNumeric(uname)) {

            if (um_forgot_pass == 3) {
                var pass = jQuery("#dig_wc_password").val();
                var cpass = jQuery("#dig_wc_cpassword").val();
                if (pass != cpass) {
                    showDigErrorMessage(dig_mdet.Passwordsdonotmatch);
                    return false;
                }
                cuForm.attr({'action': '?login=true', 'method': 'post'});
                uname_field.attr('name', 'user');
                ccode_field.attr('name', 'dig_countrycodec');
                cuForm.find('#digit_ac_otp').attr('name', 'dig_otp');
                cuForm.unbind('submit').submit();
                return true;
            }


            if (um_forgot_pass == 2) {
                verifyOtp(ccode, uname, nounce.val(), cuForm.find('#digit_ac_otp').val(), 3);
                return false;
            }

            um_forgot_pass = 1;
            prv_forg_wc = jQuery(this).val();
            jQuery(".dig_otp_um_reg").appendTo(cuForm.find('.um-field-text'));
            verifyMobileNoLogin(ccode, uname, nounce.val(), 3);

            return false;
        }
    });


    var wc_login_form = jQuery(".woocommerce-form-login");
    if (wc_login_form.length) {
        if (dig_mdet.login_mobile_accept == 1 && dig_mdet.login_mail_accept == 0 && dig_mdet.login_uname_accept == 0) {
            wc_login_form.find('#username').data('type', 2);
        }
    }

    jQuery('input[id="username"],.digits_mobile_field,.digits_ext_phone_field').each(function (index) {
        var $this = jQuery(this);
        update_username_field($this);
    });

    jQuery("#wc-pos-actions").find("#add_customer_to_register").on('click', function () {
        setTimeout(function () {
            update_username_field(jQuery('#username_field').find('#username'));
        }, 100);
    });


    function update_username_field($this) {
        if (dig_mdet.login_mobile_accept == 0) {
            var fmob = $this.attr('f-mob');

            if (!fmob || fmob == 0) return;
        }
        if (dig_mdet.mobile_accept == 0) {
            var reg = $this.attr('reg');

            if (reg == 1) return;
        }
        var usernameid = $this;

        var dig_main = usernameid.attr('data-dig-main');
        var ccd;
        if (!dig_main) {
            if ($this.attr('data-dig-mob') == 1) {
                if ($this.attr('countryCode')) {
                    ccd = $this.attr('countryCode');
                } else {
                    ccd = dig_mdet.uccode;
                }

            } else if ($this.attr('mob') != 1) {

                var lb = dig_mdet.emailormobile;


                var reg = $this.attr('reg');

                if (!reg || reg == 0) {
                    reg = 0;
                    if (dig_mdet.login_mobile_accept > 0 && dig_mdet.login_mail_accept > 0) {
                        lb = dig_mdet.emailormobile;
                    } else if (dig_mdet.login_mobile_accept > 0) {
                        lb = dig_mdet.MobileNumber;
                    } else if (dig_mdet.login_mail_accept > 0) {
                        lb = dig_mdet.email;
                    }
                } else if (reg == 1) {
                    if (dig_mdet.mobile_accept > 0 && dig_mdet.mail_accept > 0) {
                        lb = dig_mdet.emailormobile;
                    } else if (dig_mdet.mobile_accept > 0) {
                        lb = dig_mdet.MobileNumber;
                    } else if (dig_mdet.mail_accept > 0) {
                        lb = dig_mdet.email;
                    }
                }
                if (reg != 2) {
                    usernameid.prev().html(lb + " <span class=required>*</span>");
                    if (usernameid.attr('placeholder')) usernameid.attr('placeholder', lb);
                }
                ccd = dig_mdet.uccode;

            } else {
                usernameid.prev().html(dig_mdet.MobileNumber + " <span class=required>*</span>");
                if (usernameid.attr('placeholder')) usernameid.attr('placeholder', dig_mdet.MobileNumber);
                if ($this.attr('countryCode')) {
                    ccd = $this.attr('countryCode');
                } else {
                    ccd = dig_mdet.uccode;
                }


            }
        }

        var dig_ext = "";
        var dig_mainattr = "";

        var dig_ccd_name = "digt_countrycode";

        var dig_skip_label = $this.attr('data-skip-label');

        if (dig_skip_label) {
            ccd = dig_mdet.uccode;
        } else if (dig_main) {
            var tc = $this.attr('countryCode');


            if (tc !== undefined) {
                if (tc == -1) {
                    ccd = "+";
                } else {
                    ccd = "+" + tc;
                }
            } else {
                ccd = dig_mdet.uccode;
            }
            dig_ext = "dig_update_hidden ";
            dig_mainattr = 'data-dig-main="' + usernameid.attr('data-dig-main') + '"';
            dig_ccd_name = usernameid.attr('data-dig-main') + "_digt_countrycode";
        }


        usernameid.wrap('<div class="digcon"></div>').before('<div class="dig_wc_countrycodecontainer dig_wc_logincountrycodecontainer">' +
            '<input type="text" autocomplete="tel-country-code" name="' + dig_ccd_name + '" class="' + dig_ext + 'input-text countrycode dig_wc_logincountrycode" ' +
            'value="' + ccd + '" maxlength="6" size="3" placeholder="' + ccd + '" ' + dig_mainattr + '/></div>');

        if (!usernameid.attr("nan")) usernameid.attr('name', "mobile/email");


        usernameid.on("keyup change focusin", function (e) {
            var data_type = jQuery(this).data('type');
            var dclcc = jQuery(this).parent().find('.dig_wc_countrycodecontainer');
            var dcllInput = dclcc.find('input');

            var dig_main = jQuery(this).attr('data-dig-main');
            if (dig_main) {
                var ccd_dig = jQuery(this).closest('.digcon').find(".dig_update_hidden");

                var con = filter_mobile(jQuery(this).val());
                var ccdval = ccd_dig.val();
                //ccdval = ccdval.replace("+", "");
                if (con.length > 0 && ccdval.length > 0)
                    jQuery('#' + dig_main).val(ccdval + "" + con);
                else jQuery('#' + dig_main).val("");

            }
            if (isNumeric(jQuery(this).val()) || jQuery(this).attr('only-mob') || data_type == 2) {
                dclcc.css({"display": "inline-block"});


                dcllInput.trigger('keyup');
                if (jQuery(this).attr('data-show-btn')) {
                    jQuery("." + jQuery(this).attr('data-show-btn')).show();
                }
            } else {
                dclcc.hide();


                if (jQuery(this).attr('removeStyle')) jQuery(this).removeAttr('style');
                else jQuery(this).css({"padding-left": ""});

                if (jQuery(this).attr('data-show-btn')) {
                    if (dig_mdet.mobile_accept != 2) jQuery("." + jQuery(this).attr('data-show-btn')).hide();
                }
            }
            digit_validateLogin(jQuery(this));

        });


        setTimeout(function () {
            usernameid.trigger('keyup');
        }, 10);
    }


    jQuery(".dig_update_hidden").on('keyup change focusin', function () {
        var toUp = jQuery(this).attr("data-dig-main");
        var mob = jQuery(this).closest('.digcon').find("#username").val();

        mob = filter_mobile(mob);
        var ccd = jQuery(this).val();
        // ccd = ccd.replace("+", "");
        if (mob.length > 0 && ccd.length > 0)
            jQuery('#' + toUp).val(ccd + "" + mob);
        else jQuery('#' + toUp).val("");

    });


    jQuery("#dokan-vendor-register").find("#reg_email").addClass('no-overwrite');
    jQuery(".woocommerce-EditAccountForm").find("#reg_email").addClass('no-overwrite');

    jQuery('input[id="reg_email"]').each(function (index) {
        var reg_email = jQuery(this);

        if (reg_email.hasClass('no-overwrite')) {
            return;
        }

        var reg_input = reg_email.parent();

        var labe;


        var req = " <span class=required>*</span>";
        if (dig_mdet.mail_accept == 1 && dig_mdet.mobile_accept == 1) {
            labe = dig_mdet.emailormobile;
        } else if (dig_mdet.mobile_accept > 0) {
            labe = dig_mdet.MobileNumber;
            reg_email.data('type', '2');
            reg_email.attr({'autocomplete': 'tel-national', 'name': 'tel_national'});
            if (dig_mdet.mobile_accept == 1) req = ' <span class=required>(' + dig_mdet.optional + ')</span>';
        } else if (dig_mdet.mail_accept == 1) {
            labe = dig_mdet.email;
        } else {
            return;
        }


        reg_input.children("label").html(labe + req);
        if (reg_email.attr('placeholder')) {
            reg_email.attr('placeholder', labe);
        }


        reg_email.wrap('<div class="digcon"></div>')
            .before('<div class="dig_wc_countrycodecontainer dig_wc_registercountrycodecontainer"><input type="text" name="digfcountrycode" class="input-text countrycode dig_wc_registercountrycode" value="' + dig_mdet.uccode + '" maxlength="6" size="3" placeholder="' + dig_mdet.uccode + '" autocomplete="tel-country-code"/></div>');


        reg_email.on("keyup change focusin", function (e) {
            var data_type = jQuery(this).data('type');

            if (data_type == 3) return;
            var dclcc = reg_input.find('.dig_wc_countrycodecontainer');
            var dcllInput = dclcc.find('input');
            if (isNumeric(reg_email.val()) || data_type == 2) {
                dclcc.css({"display": "inline-block"});
                dcllInput.trigger('keyup');
            } else {
                dclcc.hide();
                jQuery(this).css({"padding-left": "0.75em"});
            }
            updateMailSecondLabel(reg_email);
        });


        var parentForm = jQuery(this).closest('form');


        reg_email.attr({'type': 'text'});

        setTimeout(function () {
            reg_email.trigger('keyup');
        });

    });


    user_login.parent().children("label").html(dig_mdet.emailormobile + " <span class=required>*</span>");


    jQuery('input[id="secondmailormobile"]').each(function (index) {
        if (dig_mdet.mail_accept == 2 || dig_mdet.mobile_accept == 2) return;
        sRegMail = jQuery(this);
        sRegMail.addClass();
        sRegMail.wrap('<div class="digcon"></div>').before('<div class="dig_wc_countrycodecontainer dig_wc_registersecondcountrycodecontainer"><input type="text" name="digsfcountrycode2" class="input-text countrycode dig_wc_registersecondcountrycode" value="' + dig_mdet.uccode + '" maxlength="6" size="3" placeholder="' + dig_mdet.uccode + '" autocomplete="tel-country-code"/></div>');


        if (sRegMail.attr('placeholder')) sRegMail.attr('placeholder', dig_mdet.emailormobile);
        sRegMail.on("keyup change focusin", function () {

            var dclcc = jQuery(this).parent().find('.dig_wc_registersecondcountrycodecontainer');

            var dcllInput = dclcc.find('input');

            if (isNumeric(jQuery(this).val()) && !isNumeric(reg_email.val())) {
                dclcc.css({"display": "inline-block"});
                dcllInput.trigger('keyup');

            } else {
                dclcc.hide();
                jQuery(this).css({"padding-left": "0.75em"});
            }
        });
        setTimeout(function () {
            sRegMail.trigger('keyup');
        });
    });


    jQuery('.dig_wc_registersecondcountrycode').on("keyup change focusin", function (e) {
        var dwccr = jQuery(this);
        var code = dwccr.val();
        var size = code.length;
        var curRegMail = dwccr.parent().parent().find('input#secondmailormobile');
        size++;
        if (size < 2) size = 2;
        dwccr.attr('size', size);

        if (code.trim().length == 0) {
            dwccr.val("+");
        }
        curRegMail.css({"padding-left": mobilePaddingLeft(dwccr.outerWidth() + ew / 2 + "px")}, 'fast', function () {
        });

    });


    if (!user_login.attr('disabled')) {
        user_login.wrap('<div class="digcon"></div>').before('<div class="dig_wc_countrycodecontainer forgotcountrycodecontainer"><input type="text" name="dig_countrycodec" class="input-text countrycode forgotcountrycode" value="' + dig_mdet.uccode + '" maxlength="6" size="3" placeholder="' + dig_mdet.uccode + '"/></div>');


        setTimeout(function () {
            user_login.trigger('keyup');
        });
    }

    function digit_validateLogin(usernameid) {
        var form = usernameid.closest('form');
        if (isNumeric(usernameid.val())) {
            var dclcc = usernameid.parent().find('.dig_wc_countrycodecontainer').find('input');
            form.find("#loginuname").val(dclcc.val() + usernameid.val());
        } else {

            form.find("#loginuname").val(usernameid.val());
        }
    }


    jQuery('.dig_wc_registercountrycode').on("keyup change focusin", function (e) {
        var rccBox = jQuery(this);
        var code = jQuery(this).val();
        var size = code.length;
        var curRegMail = rccBox.parent().parent().find('input#reg_email');
        size++;
        if (size < 2) size = 2;
        rccBox.attr('size', size);

        if (code.trim().length == 0) {
            rccBox.val("+");
        }
        curRegMail.css({"padding-left": mobilePaddingLeft(rccBox.outerWidth() + ew / 2 + "px")}, 'fast', function () {
        });

        updateMailSecondLabel(curRegMail);
    });


    user_login.on("keyup change focusin", function (e) {

        if (isNumeric(jQuery(this).val())) {
            jQuery(".forgotcountrycodecontainer").css({"display": "inline-block"});
            jQuery(".forgotcountrycode").trigger('keyup');
        } else {
            jQuery(".forgotcountrycodecontainer").hide();
            jQuery(this).css({"padding-left": "0.75em"});
        }
    });

    jQuery('.forgotcountrycode').on("keyup change focusin", function (e) {
        var size = jQuery(this).val().length;
        size++;
        if (size < 2) size = 2;

        jQuery(this).attr('size', size);
        var code = jQuery(this).val();
        if (code.trim().length == 0) {
            jQuery(this).val("+");
        }

        user_login.css({"padding-left": mobilePaddingLeft(jQuery('.forgotcountrycode').outerWidth(true) + ew / 2 + "px")}, 'fast', function () {
        });
    });


    var isSecondMailVisible = false;
    var inftype = 0;

    function updateMailSecondLabel(reg_email) {

        var con = reg_email.val();

        var cPar = reg_email.closest('form');

        var digSecondCountryCode = cPar.find('.dig_wc_registersecondcountrycodecontainer');
        var regContainer = reg_email.parent();


        var secondmailormobile = cPar.find('.secondmailormobile');


        var mailSecondLabel = cPar.find("#dig_secHolder");

        if ((isNumeric(con) && inftype != 1) || dig_mdet.mail_accept == 2) {
            inftype = 1;
            mailSecondLabel.html(dig_mdet.email);

            digSecondCountryCode.hide();

            secondmailormobile.css({"padding-left": "0.75em"});


        } else if (!isNumeric(con) && inftype != 2 && dig_mdet.mobile_accept != 2) {
            inftype = 2;
            mailSecondLabel.html(dig_mdet.MobileNumber);


            digSecondCountryCode.css({"display": "inline-block"});

            secondmailormobile.css({"padding-left": mobilePaddingLeft(digSecondCountryCode.find(".dig_wc_registersecondcountrycode").outerWidth() + ew / 2 + "px")});
        }

        if (dig_mdet.mail_accept != 2 && dig_mdet.mobile_accept != 2) {

            if (con == "" || con.length == 0) {
                cPar.find(".dig_wc_mailsecond").stop().slideUp();
                isSecondMailVisible = false;
                return;
            }

            if (!isSecondMailVisible) {
                cPar.find(".dig_wc_mailsecond").stop().slideDown().show();
                isSecondMailVisible = true;
            } else return;
        }
    }


    jQuery(document).on("keyup", ".dig_wc_logincountrycode", function (e) {


        var rliBox = jQuery(this);
        var code = rliBox.val();
        var size = code.length;
        var container = rliBox.parent().parent();

        var curLogMail = container.find('#username');
        if (!curLogMail.length || !curLogMail) {
            curLogMail = container.find('.digits_mobile_field');
        }

        size++;
        if (size < 2) size = 2;
        rliBox.attr('size', size);
        if (code.trim().length == 0) {
            rliBox.val("+");
        }
        curLogMail.attr("style", "padding-left:" + mobilePaddingLeft((rliBox.outerWidth() + ew / 2) + "px !important;"));

        digit_validateLogin(curLogMail);
    });


    var max = 5;


    jQuery(".login .inline").each(function () {
        var form = jQuery(this).closest('form');
        form.find('.woocommerce-LostPassword').prepend(jQuery(this));

    });


    var registerstatus = 0;


    var regDone = 0;
    register.find("input").on('focusout', function () {
        if (regDone == 1) return;
        register.find("input[type='submit']").each(function () {
            jQuery(this).removeAttr("disabled").removeClass("disabled");
        });
        regDone = 0;
    });


    var forgotDone = 0;

    var forgotOutDone = 0;

    jQuery(".woocommerce-ResetPassword input").on('focusin', function () {
        if (forgotDone == 1) return;
        jQuery(".woocommerce-ResetPassword input[type='submit']").each(function () {
            jQuery(this).removeAttr('disabled').removeClass("disabled");
        });
        forgotDone = 1;
    }).on('focusout', function () {
        if (forgotOutDone == 1) return;
        jQuery(".woocommerce-ResetPassword input[type='submit']").each(function () {
            jQuery(this).removeAttr('disabled').removeClass("disabled");
        });
        forgotOutDone = 1;
    });

    var loginDone = 0;
    jQuery("form.login input").on('focusout', function () {
        if (loginDone == 1) {
            jQuery("form.login input[type='submit']").each(function () {
                jQuery(this).removeAttr("disabled").removeClass("disabled");
            });
            loginDone = 0;
        }
    });


    var curRegForm;
    var passwcdo = 0;

    if (dig_mdet.pass_accept != 2 && dig_mdet.mobile_accept > 0) {
        register.find('input[id="reg_password"]').each(function () {
            jQuery(this).closest('.woocommerce-form-row').hide();
        });
    }


    register.find(".woocommerce-Button, button[name='register']").each(function () {
        if (jQuery(this).attr('name') == 'register') {
            if (!jQuery(this).hasClass("otp_reg_dig_wc")) {
                if (jQuery(".otp_reg_dig_wc").length)
                    jQuery(this).val(dig_mdet.RegisterWithPassword).text(dig_mdet.RegisterWithPassword).addClass("wc_reg_pass_btn");
            }
        }
    });


    register.off();
    jQuery("#reg_password").on('change', function () {
        jQuery(this).closest('form').find("[type='submit']").removeAttr('disabled');
    });
    register.find(".woocommerce-Button, button[name='register']").on('click', function (e) {

        if (registerstatus == 1) return true;
        curRegForm = jQuery(this).closest('form');

        var mail = jQuery.trim(curRegForm.find("#reg_email").val());
        var secmail = jQuery.trim(curRegForm.find("#secondmailormobile").val());

        if (jQuery(this).hasClass('otp_reg_dig_whatsapp')) {
            useWhatsApp = 1;
            lastmobileNo = -1;
            lastDtype = 2;
        }

        jQuery(".dig_otp_submit_button").removeClass('dig_otp_submit_button');
        jQuery(this).addClass('dig_otp_submit_button');

        if (jQuery(this).hasClass("otp_reg_dig_wc")) {
            if (!isNumeric(mail) && !isNumeric(secmail)) {
                showDigNoticeMessage(dig_mdet.Thisfeaturesonlyworkswithmobilenumber);
                return false;
            }

            curRegForm.find(".wc_reg_pass_btn").hide();
            curRegForm.find("#_wpnonce").parent().find("input[type='submit']").remove();
        } else if (passwcdo == 0) {

            if (!curRegForm.find("#reg_billing_otp").is(":visible")) {


                passwcdo = 1;
                var a = curRegForm.find('#reg_password').closest('.woocommerce-form-row');
                if (a.css('display') == 'none') {
                    curRegForm.find(".otp_reg_dig_wc").hide();
                    a.show();
                    return false;
                }
            }
        }
    });

    function digits_wc_recaptcha_error(res) {
        loader.hide();
    }

    function digits_wc_recaptcha_callback(token) {
        curRegForm.find('.invi-recaptcha').last().attr('data-solved', 1);
        curRegForm.submit();
    }

    register.on('submit', function (e) {

        hideDigMessage();

        if (registerstatus == 1) return true;

        curRegForm = jQuery(this);
        update_time_button = register.find(".woocommerce-Button");


        var mail = jQuery.trim(curRegForm.find("#reg_email").val());
        var secmail = jQuery.trim(curRegForm.find("#secondmailormobile").val());


        var passf = curRegForm.find("#reg_password");


        if (passf.length > 0) {
            var tpass = passf.val();
            if (dig_mdet.strong_pass == 1) {
                if (dig_mdet.pass_accept == 2 || tpass.length > 0) {
                    try {
                        var strength = wp.passwordStrength.meter(tpass, ['black', 'listed', 'word'], tpass);
                        if (strength != null && strength < 3) {
                            showDigNoticeMessage(dig_mdet.useStrongPasswordString);
                            return false;
                        }
                    } catch (e) {

                    }
                }
            }
        }


        var custom_validation = validateCustomFields(curRegForm);

        if (!custom_validation) {
            return false;
        }

        var recaptcha = curRegForm.find('.invi-recaptcha').last();
        if (recaptcha.length > 0 && !recaptcha.data('solved')) {
            var widget_id = grecaptcha.render(recaptcha.attr('id'),
                {
                    'callback': digits_wc_recaptcha_callback,
                    'error-callback': digits_wc_recaptcha_error,
                });
            grecaptcha.execute(widget_id);
            return false;
        }

        if (dig_mdet.mobile_accept == 0 && dig_mdet.mail_accept == 0) {
            return true;
        }

        if (passf.length > 0) {
            var pass = passf.val();
            if (!jQuery(this).hasClass("otp_reg_dig_wc") && passf.is(":visible")) {

                if (pass.length == 0) {
                    showDigErrorMessage(dig_mdet.invalidpassword);
                    return false;
                }
            }
            if (pass.length == 0 && validateEmail(mail) && validateEmail(secmail) && !isNumeric(mail) && !isNumeric(secmail)) {
                showDigNoticeMessage(dig_mdet.eitherentermoborusepass);
                return false;
            }
        }

        if (validateEmail(mail) && validateEmail(secmail) && secmail.length > 0) {
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            return false;
        }
        if (isNumeric(mail) && isNumeric(secmail) && secmail.length > 0) {
            showDigErrorMessage(dig_mdet.InvalidEmail);
            return false;
        }


        var dig_reg_mail = curRegForm.find(".dig_reg_mail");
        if (validateEmail(mail)) {
            dig_reg_mail.val(mail);
        } else if (validateEmail(secmail)) {
            dig_reg_mail.val(secmail);
        }


        if (dig_mdet.mail_accept == 2 && (!validateEmail(dig_reg_mail.val()))) {
            showDigErrorMessage(dig_mdet.InvalidEmail);
            return false;
        }


        if (dig_mdet.mobile_accept == 2 && !isNumeric(mail) && !isNumeric(secmail)) {
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            return false;
        }


        var otp = jQuery("#reg_billing_otp");

        if (regverify == 1) {
            if (isNumeric(mail)) {
                verifyOtp(curRegForm.find(".dig_wc_registercountrycode").val(), mail, nounce.val(), otp.val(), 2);
                return false;
            } else if (isNumeric(secmail)) {
                verifyOtp(curRegForm.find(".dig_wc_registersecondcountrycode").val(), secmail, nounce.val(), otp.val(), 2);
                return false;
            }
            return false;
        }

        if (curRegForm.find("#reg_username").length) {
            username_reg_field = curRegForm.find("#reg_username").val();
        }
        if (curRegForm.find(".dig-custom-field-type-captcha").length) {
            captcha_reg_field = curRegForm.find(".dig-custom-field-type-captcha").find("input[type='text']").val();
            captcha_ses_reg_field = curRegForm.find(".dig-custom-field-type-captcha").find(".dig_captcha_ses").val();
        }
        akCallback = 'registerWooCallBack';

        if (isNumeric(mail)) {
            email_reg_field = secmail;
            verifyMobileNoLogin(curRegForm.find(".dig_wc_registercountrycode").val(), mail, nounce.val(), 2);
            email_reg_field = mail;
            return false;
        } else if (isNumeric(secmail)) {
            verifyMobileNoLogin(curRegForm.find(".dig_wc_registersecondcountrycode").val(), secmail, nounce.val(), 2);
            return false;
        }


    });


    function registerWooCallBack(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            registerstatus = 1;

            var code = response.code;
            var csrf = response.state;
            curRegForm.find(".register_code").val(code);
            curRegForm.find(".register_csrf").val(csrf);
            curRegForm.find('[type="submit"]').click();

        }
    }


    function validateEmail(email) {
        if ((email.search('@') >= 0) && (email.search(/\./) >= 0))
            if (email.search('@') < email.split('@')[1].search(/\./) + email.search('@')) return true;
            else return false;
        else return false;
    }


    var lastcountrycode, lastmobileNo, lastDtype;

    var username_reg_field = '';
    var email_reg_field = '';
    var captcha_reg_field = '';
    var captcha_ses_reg_field = '';
    var isFirebase = 0;

    function verifyMobileNoLogin(countrycode, mobileNo, csrf, dtype) {

        otp_field = null;
        is_checkout = false;
        show_message = true;
        if (lastcountrycode == countrycode && lastmobileNo == mobileNo && lastDtype == dtype) {
            loader.hide();
            return;
        }
        dismissLoader = false;


        hideDigMessage();

        loader.show();

        if (lastDtype != dtype) {
            useWhatsApp = 0;
        }

        if (update_time_button && update_time_button.hasClass('dig_wc_mobileWhatsApp')) {
            useWhatsApp = 1;
        }


        lastcountrycode = countrycode;
        lastmobileNo = mobileNo;
        lastDtype = dtype;
        jQuery.ajax({
            type: 'post',
            url: dig_mdet.ajax_url,
            data: {
                action: 'digits_check_mob',
                countrycode: countrycode,
                mobileNo: mobileNo,
                csrf: dig_mdet.nonce,
                login: dtype,
                username: username_reg_field,
                email: email_reg_field,
                captcha: captcha_reg_field,
                captcha_ses: captcha_ses_reg_field,
                json: 1,
                whatsapp: useWhatsApp
            },
            success: function (res) {
                username_reg_field = '';
                email_reg_field = '';

                captcha_reg_field = '';
                captcha_ses_reg_field = '';

                lastDtype = 0;
                lastmobileNo = 0;

                loader.hide();

                var ak = -1;

                if (isJSON(res)) {
                    if (res.success === false) {
                        if (res.data.notice) {
                            showDigNoticeMessage(res.data.message);
                        } else {
                            showDigErrorMessage(res.data.message);
                        }
                        return;
                    }

                    ak = res.accountkit;
                    isFirebase = res.firebase;
                    res = res.code;
                } else {

                    res = res.trim();
                }


                if (res == -99) {
                    showDigErrorMessage(dig_mdet.invalidcountrycode);
                    return;
                }
                if (res == -11) {
                    if (dtype == 1) {
                        showDigNoticeMessage(dig_mdet.pleasesignupbeforelogginin);
                        return;
                    } else if (dtype == 3) {
                        showDigErrorMessage(dig_mdet.Mobilenumbernotfound);
                        return;
                    }
                } else if (res == 0) {
                    showDigErrorMessage(dig_mdet.error);
                    return;
                }
                if ((res == -1 && dtype == 2) || (res == -1 && dtype == 11)) {
                    showDigErrorMessage(dig_mdet.MobileNumberalreadyinuse);
                    return;
                }

                mobileNo = mobileNo.replace(/^0+/, '');
                countrycode = countrycode.replace(/^0+/, '');


                if (ak == 1) {
                    processAccountkitLogin(countrycode, mobileNo);
                } else if (isFirebase == 1) {
                    dismissLoader = true;
                    loader.show();

                    var phone = countrycode + mobileNo;

                    if (countrycode == '+242' || countrycode == '+225') {
                        phone = countrycode + '0' + mobileNo;
                    } else {
                        phone = countrycode + mobileNo;
                    }

                    var appVerifier = window.recaptchaVerifier;
                    firebase.auth().signInWithPhoneNumber(phone, appVerifier)
                        .then(function (confirmationResult) {

                            loader.hide();
                            window.confirmationResult = confirmationResult;

                            verifyMobNo_success(res, countrycode, mobileNo, csrf, dtype);
                        }).catch(function (error) {

                        if (error.message === 'TOO_LONG' || error.message === 'TOO_SHORT') {
                            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
                        } else {
                            showDigErrorMessage(error.message);
                        }
                        loader.hide();
                    });
                } else {
                    verifyMobNo_success(res, countrycode, mobileNo, csrf, dtype);
                }
            }
        });
    }

    function processAccountkitLogin(countrycode, phoneNumber) {
        hideDigitsLoader();

    }


    loader.on('click', function () {
        if (dismissLoader) loader.hide();
    });


    function verifyMobNo_success(res, countrycode, mobileNo, csrf, dtype) {
        dismissLoader = false;

        if (billing_page == 1) {
            digits_show_checkout_otp_modal(countrycode, mobileNo, csrf, dtype);
        } else if (dtype == 1) {
            if (res == 1) {

                if (ihc_loginform == 1) {

                    ihc_loginform = 0;

                    updateTime(jQuery(".dig_impu_login_resend").attr({
                        "countrycode": countrycode,
                        "mob": mobileNo, "csrf": csrf, "dtype": dtype
                    }));


                    var otpin = jQuery("#impu-dig-otp");
                    otpin.show().find("input").attr("required", "required").trigger('focus');
                    verifyimpuotp = 1;

                } else if (subitumotp == 1) {

                    um_login.find(".digor").hide().remove();
                    um_login.find('.um-row').slideUp();
                    um_login.find('.um-col-alt').slideUp().remove();
                    um_login.find('.um-col-alt-b').hide().remove();
                    jQuery(".dig_otp_um_login").fadeIn().find("input").attr("required", "required").trigger('focus');


                    subitumotp = 2;

                    tokenCon = um_login.find('form');
                    updateTime(jQuery(".dig_um_login_resend").attr({
                        "countrycode": countrycode,
                        "mob": mobileNo, "csrf": csrf, "dtype": dtype
                    }));


                } else {


                    updateTime(jQuery(".dig_wc_login_resend").attr({
                        "countrycode": countrycode,
                        "mob": mobileNo, "csrf": csrf, "dtype": dtype
                    }));

                    hideloginpageitems();
                    logverify = 1;

                    cuForm.find('.dig_wc_mobileLogin').not('.dig_otp_submit_button').hide();

                    var otpin = cuForm.find("#dig_wc_log_otp_container");
                    otpin.slideDown().find("input").attr("required", "required").trigger('focus');
                    jQuery("#username").closest("p").hide();
                }

            }
        } else if (dtype == 2) {

            if (dig_bp_btn == 1) {

                updateTime(jQuery(".dig_wcbil_bill_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));

                var otpin = jQuery("#dig_bp_reg_otp");
                otpin.show().find("input").attr("required", "required").trigger('focus');
                verifybpotp = 1;
                dig_bp_btn = 0;

            } else if (subitumotp == 1) {


                var otpin = jQuery(".dig_otp_um_reg");
                tokenCon = um_register.closest('form');
                otpin.slideDown().find("input").attr("required", "required").trigger('focus');
                subitumotp = 2;


                updateTime(jQuery(".dig_um_regis_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));


            } else {

                updateTime(jQuery(".dig_wc_register_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));


                curRegForm.find(".form-row").find("input[type='password']").each(function () {
                    jQuery(this).closest(".form-row").slideUp();

                });
                curRegForm.find('.otp_reg_dig_wc').not('.dig_otp_submit_button').hide();

                var otpin = curRegForm.find("#reg_billing_otp_container");
                otpin.slideDown().find("input").attr("required", "required").trigger('focus');

                regverify = 1;
            }

        } else if (dtype == 3) {


            if (forgotpassihc == 1) {


                updateTime(jQuery(".dig_impu_forg_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));
                var otpin = jQuery("#impu-dig-otp");
                otpin.show().find("input").attr("required", "required").trigger('focus');
                forgotpassMobVerifiedihc = 1;
                forgotpassihc = 0;
            } else if (um_forgot_pass == 1) {
                updateTime(jQuery(".dig_um_regis_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));
                jQuery(".dig_otp_um_reg").show();
                um_forgot_pass = 2;
            } else {
                updateTime(jQuery(".dig_wc_forgot_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));


                forgverify = 1;
                user_login.attr('name', 'forgotmail');
                var otpin = jQuery("#digit_forgot_otp_container");
                otpin.show().find("input").attr("required", "required").trigger('focus');
            }
        } else if (dtype == 11) {
            if (wpuseredit == 1) {

                var otpin = curRegForm.find(".digits-edit-phone_otp-container");
                tokenCon = curRegForm;
                otpin.slideDown().find("input").attr("required", "required").trigger('focus');
                editverify = 1;

            } else if (bpuseredit == 1) {
                var otpin = jQuery("#bp_otp_dig_ea");
                otpin.slideDown().find("input").attr("required", "required").trigger('focus');
                jQuery("#dig_bp_ac_ea_resend").show();
                updateTime(jQuery(".dig_bp_ac_ea_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));
                bpeditverify = 1;
            } else if (ihcedform == 1) {
                var otpin = jQuery("#dig_ihc_mobotp");
                tokenCon = otpin.closest('form');
                otpin.slideDown().find("input").attr("required", "required").trigger('focus');
                ihcedform = 2;
            } else {

                updateTime(jQuery(".dig_wc_acc_edit_resend").attr({
                    "countrycode": countrycode,
                    "mob": mobileNo, "csrf": csrf, "dtype": dtype
                }));
                var otpin = jQuery("#digit_ac_otp_container");
                otpin.slideDown().find("input").attr("required", "required").trigger('focus');
                editverify = 1;
            }
        }

        digits_WaitForSms();

    }

    var regverify = 0;
    var logverify = 0;
    var forgverify = 0;
    var editverify = 0;


    function hideloginpageitems() {

        var wp_login = jQuery(".wp_login");
        if (cuForm.hasClass('wp_login')) {
            cuForm.find(".digor").remove();
            cuForm.find("input[type='password']").parent().remove();
            wp_login.children().each(function () {
                if (!jQuery(this).hasClass('dig_otp_block') && jQuery(this).find(".digcon").length === 0 &&
                    jQuery(this).find(".dig_bb_wp_otp_field").length === 0) {
                    jQuery(this).hide();
                }
            });
            cuForm.find(".bbp-submit-wrapper").hide();
            cuForm.append(cuForm.find(".dig_otp_block"));
            cuForm.find(".dig_otp_block").addClass('dig_otp_blk');
            cuForm.find(".bbp-remember-me").hide();
            return;
        }

        cuForm.find(".digor").remove();
        cuForm.find(".lost_password").hide();
        cuForm.find("input[type='submit']").hide();

        cuForm.find(".dig-custom-field-type-captcha").hide();


        if (wc_checkout.length) {
            wc_checkout.find('input[type="password"]').parent().hide();
            wc_checkout.find(".form-row-first").removeClass("form-row-first");
            wc_checkout.find('#rememberme').closest('label').hide();
            wc_checkout.find('[name="login"]').remove();
        }
        jQuery('#cfw_login_modal_form .cfw-login-modal-navigation').hide();


        cuForm.find(".form-row").find("input[type='password']").each(function (index) {
            var mrow = jQuery(this).closest(".form-row");
            if (index != 1 && mrow.attr('otp') != 1)
                mrow.remove();
            else if (index == 1) {
                mrow.find("label").text(dig_mdet.MobileNumber + " *");
            }

        });
    }


    dig_login_wp_elem.on('submit', function () {
        if (logverify == 1) {
            jQuery(".dig_wc_mobileLogin").first().trigger('click');
            return false;
        }

    });
    var cuForm;

    var nounce = jQuery(".dig_nounce");
    jQuery(document).on('click', '.dig_wc_mobileLogin', function () {

        update_time_button = jQuery(this);

        cuForm = jQuery(this).closest('form');
        var countryCode = cuForm.find(".countrycode").val();

        if (cuForm.find("#username").length > 0) {
            var phoneNumber = cuForm.find("#username").val();
        } else if (cuForm.find("#user_login").length > 0) {
            var phoneNumber = cuForm.find("#user_login").val();
        } else {
            var phoneNumber = cuForm.find(".digits_mobile_field").val();
        }
        jQuery(".dig_otp_submit_button").removeClass('dig_otp_submit_button');
        jQuery(this).addClass('dig_otp_submit_button');


        if (phoneNumber == "" || countryCode == "") {
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            return false;
        }

        var otp = jQuery("#dig_wc_log_otp");

        if (dig_mdet.captcha_accept == 1) {


            captcha_reg_field = cuForm.find("input[name='digits_reg_logincaptcha']").val();
            if (captcha_reg_field != null) {
                captcha_ses_reg_field = cuForm.find(".dig-custom-field-type-captcha").find(".dig_captcha_ses").val();
                if (captcha_reg_field.length == 0) {
                    showDigErrorMessage("Please enter a valid captcha!");
                    return false;
                }
            }
        }


        if (!isNumeric(countryCode) || !isNumeric(phoneNumber)) {
            var pass = cuForm.find("input[type='password']").val();

            if (pass != null) {
                showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            }
            return false;
        }

        if (logverify == 1) {
            verifyOtp(countryCode, phoneNumber, nounce.val(), cuForm.find("#dig_wc_log_otp").val(), 1);
            return false;
        }


        if (isNumeric(phoneNumber)) {
            akCallback = 'loginCallback';

            verifyMobileNoLogin(countryCode, phoneNumber, nounce.val(), 1);
        }

        return false;
    });


    var updateProfileStatus = 0;

    function updateProfileCallback(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;

            updateProfileStatus = 1;

            curRegForm.find("input[name='code']").val(code);
            curRegForm.find("input[name='csrf']").val(csrf);
            curRegForm.find("[type='submit']").click();
        } else if (response.status === "NOT_AUTHENTICATED") {
            // handle authentication failure
        } else if (response.status === "BAD_PARAMS") {
            //Need to update this
        }

    }

    function updateCheckoutDetails(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;


            jQuery(".dig_billing_otp_signup").hide();

            jQuery("#dig_wc_bill_code").val(code);
            jQuery("#dig_wc_bill_csrf").val(csrf);


        }
    }


    var prv_forg_wc = -1;
    jQuery("form.lost_reset_password input[type='submit'],form.lost_reset_password button[type='submit']").on('click', function () {
        update_time_button = jQuery(this);
        if (prv_forg_wc == -1) {
            if (jQuery(this).is(':input')) {
                prv_forg_wc = jQuery(this).val();
            } else {
                prv_forg_wc = jQuery(this).text();
            }
        }

        if (forgotPassChange == 1) {
            var pass = jQuery("#dig_wc_password").val();
            var cpass = jQuery("#dig_wc_cpassword").val();
            if (pass != cpass) {
                showDigErrorMessage(dig_mdet.Passwordsdonotmatch);
                return false;
            }
            return true;
        }
        var mom = user_login.val();
        var countryCode = jQuery("form.lost_reset_password .forgotcountrycode").val();
        var otp = jQuery("#digit_forgot_otp");

        if (forgverify == 1) {
            verifyOtp(countryCode, mom, nounce.val(), otp.val(), 3);
            return false;
        }

        if (isNumeric(mom)) {

            jQuery("form.lost_reset_password").attr('action', window.location.pathname + "?login=true");


            akCallback = 'forgotPasswordCallBack';
            verifyMobileNoLogin(countryCode, mom, nounce.val(), 3);

            return false;
        } else {
            jQuery("form.lost_reset_password").removeAttr('action');
        }
        return true;
    });

    function forgotPasswordCallBack(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;
            forgotPassChange = 1;
            user_login.parent().parent().hide();
            user_login.attr('name', 'forgotmail');
            jQuery("#digits_wc_code").val(code);
            jQuery("#digits_wc_csrf").val(csrf);
            jQuery("form.lost_reset_password .changePassword").show();
        } else if (response.status === "NOT_AUTHENTICATED") {
            // handle authentication failure
        } else if (response.status === "BAD_PARAMS") {
            //Need to update this
        }

    }


    var lastotpcountrycode, lastotpmobileNo, lastotpDtype;

    function verifyOtp(countryCode, phoneNumber, csrf, otp, dtype) {
        dismissLoader = false;
        hideDigMessage();
        if (show_message) {
            loader.show();
        }

        if (isFirebase == 1) verify_firebase_otp(countryCode, phoneNumber, csrf, otp, dtype);
        else verify_cust_otp(countryCode, phoneNumber, csrf, otp, dtype, -1);


    }

    function verify_firebase_otp(countryCode, phoneNumber, csrf, otp, dtype) {
        phoneNumber = phoneNumber.replace(/^0+/, '');
        countryCode = countryCode.replace(/^0+/, '');

        if (otp == null || otp.length == 0) {
            loader.hide();
            showDigErrorMessage(dig_mdet.InvalidOTP);
            return;
        }
        window.confirmationResult.confirm(otp)
            .then(function (result) {

                firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
                    window.verifyingCode = false;
                    window.confirmationResult = null;
                    jQuery("#dig_ftok_fbase").remove();
                    tokenCon.append("<input type='hidden' name='dig_ftoken' value='" + idToken + "' id='dig_ftok_fbase' />");
                    verify_cust_otp(countryCode, phoneNumber, csrf, otp, dtype, idToken);
                }).catch(function (error) {
                    loader.hide();
                    showDigErrorMessage(error);
                });


            }).catch(function (error) {
            loader.hide();
            if (show_message) {
                showDigErrorMessage(dig_mdet.InvalidOTP);
            }
            add_otp_class(0, otp_field);

        });
    }

    function verify_cust_otp(countryCode, phoneNumber, csrf, otp, dtype, idToken) {
        if (lastotpcountrycode == countryCode && lastotpmobileNo == phoneNumber && lastotpDtype == otp) {
            loader.hide();
            return;
        }
        lastotpcountrycode = countryCode;
        lastotpmobileNo = phoneNumber;
        lastotpDtype = otp;

        var rememberMe = 0;
        if (jQuery("#rememberme").length) {
            rememberMe = jQuery("#rememberme:checked").length > 0;
        }

        jQuery.ajax({
            type: 'post',
            url: dig_mdet.ajax_url,
            data: {
                action: 'digits_verifyotp_login',
                countrycode: countryCode,
                mobileNo: phoneNumber,
                otp: otp,
                dig_ftoken: idToken,
                csrf: csrf,
                dtype: dtype,
                rememberMe: rememberMe,
            },
            success: function (res) {

                if (isJSON(res)) {

                    if (!res.data) {
                        res = res;
                    } else {

                        if (res.data.error_msg) {
                            loader.hide();
                            if (show_message) {
                                if (res.data.error_type) {
                                    showDigMessage(res.data.error_msg, res.data.error_type);
                                } else {
                                    showDigErrorMessage(res.data.error_msg);
                                }
                            }
                            add_otp_class(0, otp_field);
                            return;
                        }

                        if (res.data.redirect) {
                            showDigLoginSuccessMessage();
                            digits_redirect(res.data.redirect);
                            return;
                        }
                        res = res.data.code;
                    }
                } else {
                    res = res.trim();
                }


                if (res != 11) loader.hide();

                if (res == 1011) {
                    showDigErrorMessage(dig_mdet.error);
                    return;
                }

                if (res == 1013) {
                    showDigErrorMessage(dig_mdet.error);
                    return;
                }

                if (res == -99) {
                    showDigErrorMessage(dig_mdet.invalidcountrycode);
                    return;
                }

                if (res == 0) {

                    if (show_message) {
                        showDigErrorMessage(dig_mdet.InvalidOTP);
                    }

                    add_otp_class(0, otp_field);
                    return;
                } else if (res == 11) {

                    if (ihcloginform.length || subitumotp > 0) {
                        document.location.href = "/";
                    } else {
                        showDigLoginSuccessMessage();
                        var redirect_to = jQuery('input[name="redirect_to"]');
                        if (redirect_to.length) {
                            digits_redirect(redirect_to.first().val());
                        } else if (jQuery("#digits_redirect_page").length) {
                            digits_redirect(jQuery("#digits_redirect_page").val());
                        } else digits_redirect(dig_mdet.uri);

                    }


                    return;
                } else if (res == -1 && dtype != 2 && dtype != 11 && dtype != 101) {
                    showDigErrorMessage(dig_mdet.ErrorPleasetryagainlater);
                    return;
                } else if ((res == 1 && dtype == 2) || (res == 1 && dtype == 11)) {
                    showDigErrorMessage(dig_mdet.MobileNumberalreadyinuse);
                    return;
                }
                if (is_checkout) {
                    curRegForm.find('#dig_man_resend_otp_btn').hide();
                    digits_checkout_otp_verify_success(countryCode, phoneNumber, csrf, otp, dtype, idToken);
                } else if (dtype == 2) {

                    if (verifybpotp == 1) {
                        verifybpotp = 0;
                        dig_bp_btn = 2;
                        jQuery("#buddypress .signup-form").find("input[name='signup_submit']").click();
                    } else if (subitumotp == 2) {
                        submitumform = 1;
                        jQuery(".um-register").find("form").submit();
                    } else {
                        registerstatus = 1;
                        curRegForm.submit();
                    }

                } else if (dtype == 3) {


                    if (forgotpassihc == 1) {

                        jQuery("#digits_password_ihc_cont").show().find("input").attr("required", "required");
                        jQuery("#digits_cpassword_ihc_cont").show().find("input").attr("required", "required");
                        forgotpassihc = 2;
                    } else if (um_forgot_pass == 2) {
                        um_forgot_pass = 3;
                        cuForm.find('.um-field-text').hide();
                        cuForm.find('#dig_man_resend_otp_btn').hide();
                        cuForm.find('.changePassword').show();
                        update_time_button.val(prv_forg_wc);
                        update_time_button.text(prv_forg_wc);

                    } else {
                        forgotPassChange = 1;
                        user_login.parent().parent().hide();
                        jQuery("#digit_forgot_otp_container").hide();
                        jQuery(".dig_wc_forgot_resend").hide();
                        user_login.attr('name', 'forgotmail');
                        jQuery("form.lost_reset_password .changePassword").show();
                        update_time_button.val(prv_forg_wc);
                        update_time_button.text(prv_forg_wc);

                    }

                } else if (dtype == 11) {

                    if (wpuseredit == 1) {
                        updateProfileStatus = 1;
                        curRegForm.find("[type='submit']").click();

                    } else if (bpuseredit == 1) {
                        jQuery("#buddypress").find("form").off("submit").submit();
                    } else if (ihcedform == 2) {
                        submiticform = 1;
                        jQuery(".ihc-form-create-edit").submit();
                    } else {
                        updateAccountStatus = 1;
                        jQuery("form.woocommerce-EditAccountForm").submit();
                    }

                }


            }
        });
    }

    var updateAccountStatus = 0;

    jQuery("form.woocommerce-EditAccountForm input[type='submit'],form.woocommerce-EditAccountForm button[type='submit']").on('click', function () {

        update_time_button = jQuery(this);

        if (updateAccountStatus == 1) return true;

        var curForm = jQuery(this).closest('form');
        var oldMobile = curForm.find('#dig_wc_cur_phone').val();
        var curMobile = curForm.find('.dig_wc_nw_phone').val();
        var countryCode = curForm.find(".dig_wc_logincountrycode").val();
        if (curMobile.length == 0) return true;

        if (oldMobile == curMobile) return true;

        if (isNumeric(curMobile)) {


            var otp = jQuery("#digit_ac_otp");

            if (editverify == 1) {

                verifyOtp(countryCode, curMobile, nounce.val(), otp.val(), 11);

                return false;
            }


            akCallback = 'updateAccountCallback';
            verifyMobileNoLogin(countryCode, curMobile, nounce.val(), 11);

        } else {
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
        }
        return false;

    });


    function updateAccountCallback(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;

            updateAccountStatus = 1;

            jQuery("form.woocommerce-EditAccountForm #dig_wc_prof_code").val(code);
            jQuery("form.woocommerce-EditAccountForm #dig_wc_prof_csrf").val(csrf);

            jQuery("form.woocommerce-EditAccountForm input[type='submit']").click();
        } else if (response.status === "NOT_AUTHENTICATED") {
            // handle authentication failure
        } else if (response.status === "BAD_PARAMS") {
            //Need to update this
        }

    }


    var wpuseredit = 0;
    var edit_profile_form;

    jQuery(document).on('keyup', '.digits-edit-phone_field input', function () {
        var form = jQuery(this).closest('form');
        var phoneNumber = form.find(".mobile_number").val();
        var countryCode = form.find(".dig_wc_logincountrycode").val();

        var m = countryCode + phoneNumber;
        var curPhone = form.find(".dig_cur_phone").val();

        if (phoneNumber.length == 0 || curPhone == m) {
            form.find('.digits_update_mobile_submit').attr('disabled', 'disabled');
        } else {
            form.find('.digits_update_mobile_submit').removeAttr('disabled');
        }

    })

    jQuery("form#your-profile input[type='submit'],.digits_update_mobile_submit").on('click', function () {
        wpuseredit = 1;
        update_time_button = jQuery(this);
        curRegForm = jQuery(this).closest('form');
        var is_digits_update = curRegForm.find('.digits_update_mobile');
        if (updateProfileStatus == 1) return true;

        if (dig_mdet.verify_mobile == 1 || is_digits_update.length) {

            var phoneNumber = curRegForm.find(".mobile_number").val();
            var countryCode = curRegForm.find(".dig_wc_logincountrycode").val();

            var m = countryCode + phoneNumber;
            var curPhone = curRegForm.find(".dig_cur_phone").val();

            if (phoneNumber.length == 0 || curPhone == m) {
                if (is_digits_update.length) {
                    return false;
                }
                return true;
            }


            var otp = curRegForm.find(".digits_otp_field");

            if (isNumeric(phoneNumber)) {

                if (editverify == 1) {
                    verifyOtp(countryCode, phoneNumber, nounce.val(), otp.val(), 11);
                    return false;
                }
                akCallback = 'updateProfileCallback';
                verifyMobileNoLogin(countryCode, phoneNumber, nounce.val(), 11);

            } else {
                showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            }

            return false;
        }
        if (is_digits_update.length) return false;
    });

    jQuery(document).on("click", "#dig_man_resend_otp_btn", function () {

        var dbbtn = jQuery(this);
        if (!jQuery(this).hasClass("dig_resendotp_disabled")) {
            loader.show();

            if (isFirebase == 1) {
                dismissLoader = true;
                loader.show();

                var countrycode = dbbtn.attr("countrycode");
                var phone;

                if (countrycode == '+242' || countrycode == '+225') {
                    phone = countrycode + '0' + dbbtn.attr("mob");
                } else {
                    phone = countrycode + dbbtn.attr("mob");
                }

                grecaptcha.reset(window.recaptchaWidgetId);

                var appVerifier = window.recaptchaVerifier;
                firebase.auth().signInWithPhoneNumber(phone, appVerifier)
                    .then(function (confirmationResult) {
                        isDigFbAdd = 1;
                        loader.hide();
                        window.confirmationResult = confirmationResult;
                        updateTime(dbbtn);
                    }).catch(function (error) {
                    if (error.message === 'TOO_LONG' || error.message === 'TOO_SHORT') {
                        showDigErrorMessage(dig_mdet.InvalidMobileNumber);
                    } else {
                        showDigErrorMessage(dig_mdet.Invaliddetails);
                    }
                    loader.hide();
                });


            } else {
                jQuery.ajax({
                    type: 'post',
                    url: dig_mdet.ajax_url,
                    data: {
                        action: 'digits_resendotp',
                        countrycode: dbbtn.attr("countrycode"),
                        mobileNo: dbbtn.attr("mob"),
                        csrf: dbbtn.attr("csrf"),
                        login: dbbtn.attr("dtype"),
                        whatsapp: useWhatsApp
                    },
                    success: function (res) {
                        res = res.trim();
                        loader.hide();
                        if (res == 0) {
                            showDigNoticeMessage(dig_mdet.Pleasetryagain);
                        } else if (res == -99) {
                            showDigErrorMessage(dig_mdet.invalidcountrycode);
                        } else {
                            updateTime(dbbtn);
                        }
                    }
                });
            }
        }
    });


    var resendTime = dig_mdet.resendOtpTime;
    var update_time_button;

    function updateTime(time) {

        tokenCon = time.closest('form');

        if (update_time_button) {
            if (update_time_button.is('input')) {
                update_time_button.attr('value', dig_mdet.SubmitOTP);
            } else {
                update_time_button.text(dig_mdet.SubmitOTP);
            }
        }


        time.attr("dis", 1).addClass("dig_resendotp_disabled").show().find("span").show();
        var time_spam = time.find("span");
        time_spam.text(convToMMSS(resendTime));
        var counter = 0;
        var interval = setInterval(function () {
            var rem = resendTime - counter;
            time_spam.text(convToMMSS(rem));
            counter++;

            if (counter >= resendTime) {
                clearInterval(interval);
                time.removeAttr("dis").removeClass("dig_resendotp_disabled").find("span").hide();
                counter = 0;
            }

        }, 1000, true);
    }

    function convToMMSS(timeInSeconds) {
        var sec_num = parseInt(timeInSeconds, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return "(" + minutes + ':' + seconds + ")";
    }


    jQuery(document.body).on('payment_method_selected', function () {
        var place_order = jQuery('#place_order').text();
    })

    jQuery(document.body).on('updated_checkout', function (e) {
    })


    var verfiybilling = 0;
    var billing_page = 0;
    if ((jQuery('.woocommerce-checkout').length || jQuery("#checkout").length)) {
        var billing_otp_field = jQuery("#dig_billing_otp");
        billing_otp_field.closest("p").hide();

        var regForm;
        var undigbill = jQuery(".woocommerce-checkout");

        var createAccount = undigbill.find(".create-account").last();

        jQuery(document).on('change', '#createaccount', function () {
            createAccount.find('.digcon #username').trigger('keyup');
        });

        var digchbtn = "<input type='submit' class='dig_billing_otp_signup' onclick='verifyOTPbilling(1);return false;' value='" + dig_mdet.verifymobilenumber + "'/>";

        if (!(dig_billing_password.length && dig_mdet.pass_accept == 1)) {
            undigbill.attr('data-show-btn', 'dig_billing_otp_signup');
        }

        if (dig_mdet.mobile_accept == 2) {
            jQuery(".dig_billing_otp_signup").show();
        }

        /* createAccount.append("" +
             "<div class='dig_billing_wc_dv'>" +
             digchbtn +
             '</div><div  class="dig_resendotp dig_wcbil_bill_resend" id="dig_man_resend_otp_btn" dis="1">' + dig_mdet.resendOTP + ' <span>(00:<span>30</span>)</span></div>' +
             "<a id='dig_billing_validate_button' style='display:none;'></a><a id='dig_billing_signupwithpassword' style='display:none;'></a><br /> ");*/

        var tasc = 0;

        function digits_checkout_otp_verify_success(countryCode, phoneNumber, csrf, otp, dtype, idToken) {
            var form = jQuery('form.checkout');

            if (!form.find('#digits_checkout_otp').length) {
                form.append('<input type="hidden" name="digit_ac_otp" id="digits_checkout_otp" />');
            }
            form.find('#digits_checkout_otp').val(otp);

            digits_process_checkout()
        }

        function digits_show_checkout_otp_modal(countrycode, mobileNo, csrf, dtype) {
            var nonce = jQuery('#place_order').data('digits_verify');
            loader.show()
            jQuery.ajax({
                type: 'post',
                url: dig_mdet.ajax_url,
                data: {
                    action: 'digits_wc_checkout_phone_verification_modal',
                    _ajax_nonce: nonce,
                },
                success: function (res) {
                    var data = res.data;
                    if (res.success) {
                        jQuery('.digits_wc_checkout_phone_verification_modal').remove();
                        var html = jQuery(data.html);
                        jQuery('body').append(html);
                        html.find('input').focus().attr('dtype', dtype);
                    } else {
                        showDigErrorMessage(data.message)
                    }
                    loader.hide();

                },
                error: function (res) {
                    loader.hide();
                }
            });

        }

        jQuery(document).on('click', '.digits-checkout_phone_verification .digits-form_button', function (e) {
            var $this = jQuery(this);
            var form = jQuery('form.checkout');
            otp_field = $this.closest('form').find('#digits_secure_billing_phone_otp');
            var otp = otp_field.val();
            var dtype = otp_field.attr('dtype');
            unbpchk = form.find("#username");
            curRegForm = form;
            is_checkout = true;

            if (otp == null || otp.length == 0) {
                return false;
            }

            if (isFirebase == 1 && otp.length != 6) {
                return false;
            }
            tokenCon = form;
            var phone = unbpchk.val();
            var countrycode = form.find(".dig_wc_logincountrycode").val();
            verifyOtp(countrycode, phone, nounce.val(), otp, dtype);

            return false;
        })

        function digits_process_checkout() {
            jQuery('.digits_wc_checkout_phone_verification_modal').fadeOut('fast');
            jQuery('form.checkout').trigger('submit');
        }


        jQuery(document).on('click', '.digits_wc_checkout_phone_verification_modal .digits_secure_modal-close', function (e) {
            var container = jQuery(this).closest('.digits_secure_modal_box');
            container.fadeOut();

            return false;
        })

        jQuery(document).on('digits_process_wc_checkout', function () {
            var form = jQuery('form.checkout');

            var create_verify_inp = form.find('#digits_vcustomer_phone');

            var dtype = 2;
            var verify = false;

            if (!create_verify_inp.length) {
                if (dig_mdet.mob_verify_checkout == 1 && dig_mdet.mobile_accept > 0) {
                    verify = true;
                } else {
                    verify = false;
                }
            } else {
                var create_verify = create_verify_inp.val();
                var payment_verify = form.find('#digits_vbill_phone').val();
                var guest_verify = form.find('#digits_guest_vbill_phone').val();

                var createaccount = jQuery('input#createaccount');

                if (dig_mdet.mobile_accept > 0) {
                    if (create_verify !== 'all') {
                        if (create_verify === 'check') {
                            verify = createaccount.is(':checked');
                        }
                    } else {
                        verify = true;
                    }
                }

                var payment_method = form.find('input[name="payment_method"]:checked').val();

                if (wc_checkout_params.option_guest_checkout === 'yes') {
                    if (!verify && guest_verify !== 'none') {
                        if (!createaccount.length || !createaccount.is(':checked')) {
                            if (payment_method === 'cod' && guest_verify === 'cod') {
                                verify = true;
                                dtype = 101;
                            } else if (guest_verify === 'all_methods') {
                                verify = true;
                                dtype = 101;
                            }
                        }
                    }
                }

                if (!verify && payment_verify !== 'none') {
                    if (form.find('#digits_customer_checkout').length > 0 || (createaccount.length && createaccount.is(':checked'))) {
                        if (payment_method === 'cod' && payment_verify === 'cod') {
                            verify = true;
                            dtype = 101;
                        } else if (payment_verify === 'all_methods') {
                            verify = true;
                            dtype = 101;
                        }

                    }
                }
            }

            if (!verify || form.find('#digits_checkout_otp').length > 0) {
                digits_process_checkout();
                return true;
            }

            var $this = form.find('#place_order');
            billing_page = 1;
            unbpchk = form.find("#username");


            var error = false;
            form.find('input').each(function () {
                var inp = jQuery(this);
                var val = inp.val();
                if (inp.is(":visible") && val.length == 0) {
                    var par = jQuery(this).closest('.form-row');
                    if (par.hasClass('validate-required')) {
                        error = true;
                        return true;
                    }
                }
            });


            var custom_validation = validateCustomFields(createAccount);

            if (!custom_validation || error) {
                showDigNoticeMessage(dig_mdet.fillAllDetails);
                return false;
            }


            var termsCheckBox = form.find('#terms');
            if (termsCheckBox.length > 0) {
                var termsCheckBoxChecked = termsCheckBox.prop('checked');
                if (!termsCheckBoxChecked) {
                    showDigErrorMessage(dig_mdet.accepttac);
                    return false;
                }
            }


            if (jQuery(".dig_opt_mult_con_tac").find('.dig_input_error').length) {
                showDigErrorMessage(dig_mdet.accepttac);
                return false;
            }

            if (dig_log_obj.mobile_accept == 0 && dig_log_obj.mail_accept == 0) {
                digits_process_checkout();
                return true;
            }

            var phone = unbpchk.val();
            var countrycode = form.find(".dig_wc_logincountrycode").val();

            if (!isNumeric(phone) && dig_mdet.mobile_accept != 2) {
                showDigErrorMessage(dig_mdet.InvalidMobileNumber);
                return false;
            }
            if (isNumeric(phone)) {
                akCallback = 'updateCheckoutDetails';
                verifyMobileNoLogin(countrycode, phone, nounce.val(), dtype);

            } else {
                showDigErrorMessage(dig_mdet.InvalidMobileNumber);
                return false;
            }
        })

    }

    var unbpchk;
    var ihcloginform = jQuery("#ihc_login_form");

    var acur = window.location.href;
    acur = acur.substring(0, acur.indexOf('?'));


    if (ihcloginform.length && dig_mdet.login_mobile_accept > 0) {
        var usernameihc = ihcloginform.find("#iump_login_username");
        var passwordihc = ihcloginform.find("#iump_login_password");
        usernameihc.attr("placeholder", dig_mdet.UsernameMobileno);


        //ihcloginform.attr("action", acur + "?login=true");

        var ccd = dig_mdet.uccode;


        ihcloginform.find("input[type='hidden']").val(dig_mdet.nonce).attr("name", "dig_nounce");

        ihcloginform.append("<input type='hidden' value='true' name='isimpc' />");

        usernameihc.wrap('<div class="digcon"></div>').before('<div class="dig_ihc_countrycodecontainer dig_ihc_logincountrycodecontainer" style="display: none;">' +
            '<input type="text" name="countrycode" class="input-text countrycode dig_ihc_logincountrycode" ' +
            'value="' + ccd + '" maxlength="6" size="3" placeholder="' + ccd + '" style="position: absolute;top:0;"/></div>');

        usernameihc.on("keyup change focusin", function (e) {
            if (isNumeric(jQuery(this).val())) {
                jQuery(".dig_ihc_logincountrycodecontainer").css({"display": "inline-block"});
                jQuery(this).attr('style', "padding-left:" + mobilePaddingLeft((jQuery(".dig_ihc_logincountrycode").outerWidth(true) + 10) + "px !important"));
            } else {
                jQuery(".dig_ihc_logincountrycodecontainer").hide();
                jQuery(this).removeAttr('style');
            }
        });

        jQuery('<div class="impu-form-line-fr impu-dig-otp" id="impu-dig-otp" style="display: none;">' +
            '<input value="" id="digits_otp_ihc" name="digit_otp" placeholder="' + dig_mdet.OTP + '" type="text" style="padding-left:10px !important;">')
            .insertBefore("#ihc_login_form .impu-form-submit");


        jQuery('.dig_ihc_logincountrycode').on("keyup change focusin", function (e) {
            var size = jQuery(this).val().length;
            size++;
            if (size < 2) size = 2;
            jQuery(this).attr('size', size);
            var code = jQuery(this).val();
            if (code.trim().length == 0) {
                jQuery(this).val("+");
            }
            usernameihc.attr('style', "padding-left:" + mobilePaddingLeft((jQuery(".dig_ihc_logincountrycode").outerWidth(true) + 10) + "px !important"));
        });


        jQuery('#ihc_login_form').off('submit');

        var remotp = 0;

        if (!dig_mdet.secure_forms) {
            jQuery(document).on("click", "#impu_log_submit", function () {
                update_time_button = jQuery(this);
                cuForm = jQuery(this).closest('form');

                if (verifyimpuotp == 1) {
                    verifyOtp(jQuery(".dig_ihc_logincountrycode").val(), usernameihc.val(), dig_mdet.nonce, jQuery("#digits_otp_ihc").val(), 1);
                    return false;
                }

                if (isNumeric(usernameihc.val())) {
                    ihc_loginform = 1;

                    akCallback = 'loginCallback';
                    verifyMobileNoLogin(jQuery(".dig_ihc_logincountrycode").val(), usernameihc.val(), dig_mdet.nonce, 1);


                    if (remotp == 0) {
                        remotp = 1;

                        ihcloginform.find("#digorimp").hide();
                        ihcloginform.find('.impu-form-submit').find("input:first").remove();

                        ihcloginform.find("div").each(function (index) {
                            if (index > 1) {
                                if (!jQuery(this).hasClass("impu-form-submit") && !jQuery(this).hasClass("dig_ihc_logincountrycodecontainer") && !jQuery(this).hasClass("impu-dig-otp"))
                                    jQuery(this).hide();
                            }
                        });
                    }
                }
                return false;
            });
            if (dig_mdet.login_otp_accept > 0) {
                ihcloginform.find(".impu-form-submit").append("<div id='digorimp'> " + dig_mdet.or + "<br /><br /></div>" +
                    "<input type='submit' id='impu_log_submit' value='" + dig_mdet.loginwithotp + "' />" +
                    "<div class='dig_resendotp dig_impu_login_resend' id='dig_man_resend_otp_btn' dis='1'>" + dig_mdet.resendOTP + " <span>(00:<span>30</span>)</span></div></div>");
            }
        }
    }
    var verifyimpuotp = 0;
    var ihc_loginform = 0;


    var ihcforgotpasswrap = jQuery(".ihc-pass-form-wrap");
    var ihforgaction = ihcforgotpasswrap.find("input[type='hidden']");
    var forgotpassMobVerifiedihc = 0;
    var forgotpassihc = 0;
    if (ihforgaction.val() == "reset_pass" && dig_mdet.forgot_pass > 0) {

        var ihcforgpassform = ihcforgotpasswrap.find("form");


        var ihcforgsub = ihcforgpassform.find("input[type='submit']");

        jQuery("<div class='dig_resendotp dig_impu_forg_resend' id='dig_man_resend_otp_btn' dis='1'>" + dig_mdet.resendOTP + " <span>(00:<span>30</span>)</span></div>")
            .insertAfter(ihcforgsub);

        ihcforgpassform.append("<input type='hidden' name='dig_nounce' value='" + dig_mdet.nonce + "' /><input type='hidden' name='ihc' value='true' />");

        var ihcForgotUsername = ihcforgotpasswrap.find("input[type='text']");


        ihcforgpassform.on('submit', function (e) {
            update_time_button = jQuery(this);
            if (forgotpassihc == 2) {
                var pass = jQuery("#digits_password_ihc").val();
                var cpass = jQuery("#digits_cpassword_ihc").val();
                if (pass != cpass) {
                    showDigErrorMessage(dig_mdet.Passwordsdonotmatch);
                    return false;
                }
                ihcforgpassform.off('submit').submit();
                return;
            }
            forgotpassihc = 1;
            if (isNumeric(ihcForgotUsername.val())) {


                ihcforgpassform.attr("action", acur + "?login=true");
                ihcForgotUsername.attr("name", "forgotmail");

                var countrycode = jQuery(".dig_ihc_forgotcountrycode").val();

                akCallback = 'forgotihcCallback';


                if (forgotpassMobVerifiedihc == 0) {
                    verifyMobileNoLogin(countrycode, ihcForgotUsername.val(), dig_mdet.nonce, 3);
                } else {
                    forgotpassihc = 1;
                    verifyOtp(countrycode, ihcForgotUsername.val(), dig_mdet.nonce, jQuery("#digits_otp_forg_ihc").val(), 3)

                }

                return false;
            }
            ihcForgotUsername.attr("name", "email_or_userlogin");
            ihcforgpassform.removeAttr("action");
            return true;

        });


        var ccd = dig_mdet.uccode;

        ihcForgotUsername.wrap('<div class="digcon"></div>').before('<div class="dig_ihc_forgot_countrycodecontainer dig_ihc_forgot_logincountrycodecontainer" style="display: none;">' +
            '<input type="text" name="countrycode" class="input-text countrycode dig_ihc_forgotcountrycode" ' +
            'value="' + ccd + '" maxlength="6" size="3" placeholder="' + ccd + '" style="position: absolute;top:0;"/></div>');
        ihcForgotUsername.attr("placeholder", dig_mdet.UsernameMobileno);

        jQuery(
            '<div class="impu-form-line-fr" id="digits_password_ihc_cont" style="display: none;"><input value="" id="digits_password_ihc" name="digits_password" placeholder="' + dig_mdet.Password + '" type="password" style="padding-left:10px !important;"></div>' +
            '<div class="impu-form-line-fr" id="digits_cpassword_ihc_cont" style="display: none;"><input value="" id="digits_cpassword_ihc" name="digits_cpassword" placeholder="' + dig_mdet.ConfirmPassword + '" type="password" style="padding-left:10px !important;"></div>')
            .insertAfter(ihcForgotUsername.closest(".impu-form-line-fr"));

        jQuery('<div class="impu-form-line-fr impu-dig-otp" id="impu-dig-otp" style="display: none;"><input value="" id="digits_otp_forg_ihc" name="dig_otp" placeholder="' + dig_mdet.OTP + '" type="text" style="padding-left:10px !important;" autocomplete="one-time-code"></div>')
            .insertAfter(ihcForgotUsername.closest(".impu-form-line-fr"));

        jQuery('<input type="hidden" name="code" id="digits_impu_code"/><input type="hidden" name="csrf" id="digits_impu_csrf"/>')
            .insertAfter(ihcForgotUsername.closest(".impu-form-line-fr"));


        ihcForgotUsername.on("keyup change focusin", function (e) {
            if (isNumeric(jQuery(this).val())) {
                jQuery(".dig_ihc_forgot_countrycodecontainer").css({"display": "inline-block"});
                jQuery(this).attr('style', "padding-left:" + mobilePaddingLeft((jQuery(".dig_ihc_forgotcountrycode").outerWidth(true) + 10) + "px !important"));

            } else {
                jQuery(".dig_ihc_forgot_countrycodecontainer").hide();
                jQuery(this).removeAttr('style');

            }
        });

        jQuery('.dig_ihc_forgotcountrycode').on("keyup change focusin", function (e) {
            var size = jQuery(this).val().length;
            size++;
            if (size < 2) size = 2;
            jQuery(this).attr('size', size);
            var code = jQuery(this).val();
            if (code.trim().length == 0) {
                jQuery(this).val("+");
            }
            ihcForgotUsername.attr('style', "padding-left:" + mobilePaddingLeft((jQuery(".dig_ihc_forgotcountrycode").outerWidth(true) + 10) + "px !important"));
        });

    }


    function mobilePaddingLeft(value) {
        if (dig_mdet.dig_hide_ccode == 1) {
            return '0.75em';
        } else {
            return value;
        }
    }

    if (jQuery(".dig_bp_enb").length) {
        jQuery(".dig_bp_enb").each(function (index) {
            jQuery(this).remove();
        });
    }
    var dig_bp_btn = 0;
    var verfiyBPReg = 0;

    jQuery(document).on("click", "#signup_submit_pass_bp", function () {
        if (verfiyBPReg == 1) return true;
        verfiyBPReg = 1;
        var bpForm = jQuery("#buddypress").find("form");

        bpForm.find("#dig_reg_bp_pass").show().find("input").attr("required", "required");
        bpForm.find("#signup_submit_otp_bp").hide();
        return false;
    });

    jQuery("#buddypress").find('#signup-form,#signup_form').addClass('signup-form');
    jQuery("#buddypress .signup-form").on('submit', function () {
        update_time_button = jQuery(this).find('input[name="signup_submit"]');
        if (dig_bp_btn == 2) return true;
        dig_bp_btn = 1;

        var bpForm = jQuery(this);
        tokenCon = bpForm;
        var phone = bpForm.find("#username").val();
        var countrycode = bpForm.find(".dig_wc_logincountrycode").val();
        var otp = jQuery("#dig_bp_reg_otp");


        var pass = bpForm.find("#signup_password").val();


        if (dig_mdet.strong_pass == 1) {
            if (dig_mdet.pass_accept == 2 || pass.length > 0) {
                var strength = wp.passwordStrength.meter(pass, ['black', 'listed', 'word'], pass);
                if (strength != null && strength < 3) {
                    showDigNoticeMessage(dig_mdet.useStrongPasswordString);
                    return false;
                }
            }
        }


        if (verifybpotp == 1) {
            verifyOtp(countrycode, phone, nounce.val(), otp.find("input").val(), 2);
        } else if (phone.length == 0) {
            showDigNoticeMessage(dig_mdet.pleaseentermobormail);
        } else if (pass.length == 0 && !isNumeric(phone)) {
            showDigNoticeMessage(dig_mdet.eitherentermoborusepass);
        } else if (isNumeric(phone)) {


            if (bpForm.find("#signup_submit_otp_bp").is(':visible')) bpForm.find("#signup_submit_pass_bp").remove();


            akCallback = 'updateRegisterDetails';
            verifyMobileNoLogin(countrycode, phone, nounce.val(), 2);


        } else if (validateEmail(phone)) {
            return true;
        } else {
            showDigErrorMessage(dig_mdet.Invaliddetails);
        }
        return false;
    });

    var verifybpotp = 0;

    function updateRegisterDetails(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;

            jQuery("#dig_bp_reg_code").val(code);
            jQuery("#dig_bp_reg_csrf").val(csrf);
            dig_bp_btn = 2;
            jQuery("#buddypress").find("form").submit();
        }
    }


    var bpuseredit = 0;
    var bpeditverify = 0;

    jQuery("#buddypress").find("form#settings-form").on('submit', function () {
        update_time_button = jQuery(this).find('[type="submit"]');
        var form = jQuery(this);
        tokenCon = form;
        var uname = form.find("#username").val();
        var ccode = form.find(".dig_wc_logincountrycode").val();

        if (jQuery("#dig_superadmin").length) return true;

        if (isNumeric(uname)) {
            if (uname == form.find("#dig_bp_current_mob")) return true;
            if (bpeditverify == 1) {
                var otp = jQuery("#bp_otp_dig_ea");
                verifyOtp(ccode, uname, nounce.val(), otp.find("input").val(), 11);
            } else {
                bpuseredit = 1;
                akCallback = 'updateBPAccountDetails';

                verifyMobileNoLogin(ccode, uname, nounce.val(), 11);

            }
        } else return true;
        return false;
    });

    function updateBPAccountDetails(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;

            jQuery("#dig_bp_ea_code").val(code);
            jQuery("#dig_bp_ea_csrf").val(csrf);
            dig_bp_btn = 2;
            jQuery("#buddypress").find("form").off("submit").submit();
        }
    }


    if (dig_mdet.login_mobile_accept !== 0) {
        var bb_wp_lform = jQuery(".wp_login");
        if (dig_mdet.login_mail_accept == 0 && dig_mdet.login_uname_accept == 0) {
            bb_wp_lform.find('#username').data('type', 2);
        }
        if (!bb_wp_lform.length) {
            bb_wp_lform = jQuery(".wp-core-ui #loginform");
            bb_wp_lform.addClass('wp_login');
        }
        if (!dig_mdet.secure_forms) {
            if (bb_wp_lform.length && dig_mdet.login_otp_accept > 0) {
                bb_wp_lform.addClass('digits');
                bb_wp_lform.find("[type='submit']").parent().append("<div class='dig_otp_block'><div class='digor'> " + dig_mdet.or + "<br /><br /></div>" +
                    "<input type='submit' class='dig_wc_mobileLogin button button-primary button-large' id='wp_bb_log_submit' value='" + dig_mdet.loginwithotp + "' />" +
                    "<div class='dig_resendotp dig_wc_login_resend dig_bb_login_resend' id='dig_man_resend_otp_btn' dis='1'>" + dig_mdet.resendOTP + " <span>(00:<span>30</span>)</span></div></div></div>");
            }
        }
    }
    jQuery(".wp_reg").on('submit', function () {

        if (registerstatus == 1) return true;

        update_time_button = jQuery(this).find("[type='submit']");
        curRegForm = jQuery(this);
        tokenCon = curRegForm;
        var mobile = formatMobileNumber(curRegForm.find("#username").val());
        var ccode = curRegForm.find(".dig_wc_logincountrycode").val();


        var custom_validation = validateCustomFields(curRegForm);

        if (!custom_validation) {
            return false;
        }

        if (dig_mdet.mobile_accept == 0) {
            return true;
        }

        if (!isNumeric(mobile) || !isNumeric(ccode) || ccode.length == 0 || mobile.length == 0) {
            if (mobile.length == 0 && dig_mdet.mobile_accept == 1) {
                return true;
            }
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            return false;
        }


        var otp = jQuery("#reg_billing_otp");

        if (regverify == 1) {
            verifyOtp(ccode, mobile, nounce.val(), otp.val(), 2);
            return false;
        }


        if (curRegForm.find("#user_uname").length) {
            username_reg_field = curRegForm.find("#user_uname").val();
        }
        if (curRegForm.find(".dig-custom-field-type-captcha").length) {
            captcha_reg_field = curRegForm.find(".dig-custom-field-type-captcha").find("input[type='text']").val();
            captcha_ses_reg_field = curRegForm.find(".dig-custom-field-type-captcha").find(".dig_captcha_ses").val();
        }
        email_reg_field = curRegForm.find("#user_email").val();


        akCallback = 'registerWooCallBack';
        verifyMobileNoLogin(ccode, mobile, nounce.val(), 2);

        return false;

    });


    function updateIHCAccountDetails(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;

            jQuery("#dig_ihc_ea_code").val(code);
            jQuery("#dig_ihc_ea_csrf").val(csrf);
            submiticform = 1;
            jQuery(".ihc-form-create-edit").submit();
        }
    }

    var submiticform = 0;
    var ihcedform = 0;
    if (c.length) {

        var e = jQuery("#dig_ihc_mobcon");

        if (jQuery(".iump-register-form").find("#edituser").length && dig_mdet.mobile_accept > 0) {
            jQuery(c).prepend(e);
            jQuery(e.find("#dig_ihc_mobotp")).insertBefore(c.find("input[type='submit']").closest('.iump-submit-form'));
        }

        jQuery(".ihc-form-create-edit input[type=submit]").on('click', function () {
            update_time_button = jQuery(this);
            var form = jQuery(".ihc-form-create-edit");

            if (submiticform == 1 || !form.find("#username").length) return true;
            var mob = form.find("#username").val();
            var ccode = form.find(".dig_wc_logincountrycode").val();

            if (mob == form.find("#dig_ihc_current_mob").val()) return true;

            if (isNumeric(mob)) {
                if (ihcedform == 2) {
                    var otp = form.find("#dig_ihc_mobotp");
                    verifyOtp(ccode, mob, nounce.val(), otp.find("input").val(), 11);

                } else {
                    akCallback = 'updateIHCAccountDetails';

                    ihcedform = 1;
                    verifyMobileNoLogin(ccode, mob, nounce.val(), 11);
                }

            } else if (mob.length > 0) {
                showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            } else return true;
            return false;
        })
    }


    var submitumform = 0;
    var subitumotp = 0;

    um_register.find("form").on('submit', function () {

        update_time_button = jQuery(this).find('#um-submit-btn');
        if (submitumform == 1) return true;
        var form = jQuery(this);
        var uid = form.find("#username").val();
        var ccode = form.find(".dig_wc_logincountrycode").val();
        var c = form.find(".dig_otp_um_reg");
        if (!uid) return true;
        if (form.find("#um_sub").length > 0) {
            return true;
        }

        var custom_validation = validateCustomFields(form);
        if (!custom_validation) {
            return false;
        }


        if (!isNumeric(uid)) {
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            return false;
        }
        loader.show();

        uid = formatMobileNumber(uid);

        akCallback = 'submitUMRegform';

        if (subitumotp == 2) {
            verifyOtp(ccode, uid, nounce.val(), c.find("input").val(), 2);
        } else {

            subitumotp = 1;
            verifyMobileNoLogin(ccode, uid, nounce.val(), 2);
        }


        jQuery(".um-register").find("input[type='submit']").removeAttr('disabled');
        return false;
    });


    jQuery(".dig_um_loginviaotp").on('click', function () {
        update_time_button = jQuery(this);
        var phoneNumber = um_login.find("#username").val();
        var csrf = jQuery(".dig_nounce").val();
        var countryCode = um_login.find(".dig_wc_logincountrycode").val();
        if (phoneNumber == "" || countryCode == "") {
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            return false;
        }
        var otpin = jQuery(".dig_otp_um_login");


        if (!isNumeric(phoneNumber) || !isNumeric(phoneNumber)) {
            showDigErrorMessage(dig_mdet.InvalidMobileNumber);
            return false;
        }

        if (subitumotp == 2) {
            verifyOtp(countryCode, phoneNumber, csrf, otpin.find("input").val(), 1);
            return false;
        }
        if (isNumeric(phoneNumber)) {

            akCallback = 'loginCallback';

            subitumotp = 1;
            verifyMobileNoLogin(countryCode, phoneNumber, csrf, 1);

        } else if (phoneNumber.length > 0) {
            showDigNoticeMessage(dig_log_obj.Thisfeaturesonlyworkswithmobilenumber);
        } else {
            akCallback = 'loginCallback';

            verifyMobileNoLogin(countryCode, phoneNumber, csrf);


        }
        return false;

    });

    function submitUMRegform(response) {
        showDigitsLoader(true);
        if (response.status === "PARTIALLY_AUTHENTICATED") {
            var code = response.code;
            var csrf = response.state;

            jQuery("#digits_um_code").val(code);
            jQuery("#digits_um_csrf").val(csrf);
            submitumform = 1;
            jQuery(".um-register").find("form").submit();
        }
    }

    if (jQuery("#dig_reg_mail").length > 0) {
        if (jQuery("#reg_email").attr('placeholder') != '' && jQuery("#reg_email").attr('placeholder') != null) {
            var fn_pld = jQuery("#reg_billing_first_name");
            fn_pld.attr('placeholder', jQuery.trim(fn_pld.parent().find('label').text()));
            register.find('.dig-custom-field').each(function () {


                var lb = jQuery.trim(jQuery(this).find('label').text());
                if (lb) jQuery(this).find('input').attr('placeholder', lb);


            });
        }
    }


    function formatMobileNumber(number) {
        return number.replace(/^0+/, '');
    }


    function validateCustomFields(form) {
        var error = false;


        if (form.attr('wait')) {
            showDigNoticeMessage(form.attr('wait'));
            return false;
        }

        if (form.attr('error')) {
            showDigErrorMessage(form.attr('error'));
            return false;
        }


        form.find('input,textarea,select').each(function () {
            if ((jQuery(this).attr('required') && jQuery(this).is(":visible")) ||
                jQuery(this).attr('data-req')) {

                var $this = jQuery(this);
                var dtype = $this.attr('dtype');

                if (dtype && dtype == 'range') {
                    var range = $this.val().split('-');
                    if (!range[1]) {
                        error = true;
                        $this.val('');
                    }
                }
                if ($this.attr('date')) {

                    if (dtype == 'time') {
                        var validTime = $this.val().match(/^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/);
                        if (!validTime) {
                            error = true;
                            $this.val('');
                        }
                    } else if (dtype != 'range') {
                        var date = new Date($this.val());

                        if (!isDateValid(date)) {
                            error = true;
                            $this.val('');

                        }
                    } else {
                        var date1 = new Date(range[0]);
                        var date2 = new Date(range[1]);
                        if (!isDateValid(date1) || !isDateValid(date2)) {
                            error = true;
                            $this.val('');

                        }
                    }
                } else if ($this.is(':checkbox') || $this.is(':radio')) {

                    if (!$this.is(':checked') && !jQuery('input[name="' + $this.attr('name') + '"]:checked').val()) {
                        error = true;
                    }
                } else {
                    var value = $this.val();
                    if (value == null || value.length == 0 || (value == -1 && $this.is("select"))) {
                        error = true;
                        if ($this.is("select"))
                            $this.next().addClass('dig_input_error');

                        $this.trigger('focus');
                    }
                }

            }

        });


        if (error) {
            showDigNoticeMessage(dig_mdet.fillAllDetails);
            return false;
        }
        if (form.find(".dig_opt_mult_con_tac").find('.dig_input_error').length) {
            showDigErrorMessage(dig_mdet.accepttac);
            return false;
        }

        return true;
    }


    function hideDigitsLoader() {
        jQuery('body').addClass('dig_low_overlay');
        loader.show();
        hideDigMessage();

    }

    function showDigitsLoader(hideLoader) {
        jQuery('body').removeClass('dig_low_overlay');
        if (hideLoader) loader.hide();

    }

    function isDateValid(date) {
        return date.getTime() === date.getTime();
    }

    function isJSON(data) {
        if (typeof data != 'string')
            data = JSON.stringify(data);

        try {
            JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }

    function add_otp_class(status, field) {
        if (field == null) return;
        var container = field.parent().parent();
        container.find('.otp_message').remove();
        var read_only = false;

        var otp_class;
        if (status == 10) {
            otp_class = 'checking_otp';
        } else if (status == 1) {
            read_only = true;
            otp_class = 'valid_otp';
            container.append('<div class="otp_message otp_valid_message">' + dig_mdet.codevalidproceedcheckout + '</div>');
        } else if (status == -1) {
            otp_class = '';
        } else {
            otp_class = 'invalid_otp';
        }

        field.attr('readonly', read_only);
        container.removeClass('valid_otp invalid_otp checking_otp').addClass(otp_class);


    }


    /*Remove Duplicate Fields*/
    var dokan_if_seller = jQuery(".woocommerce-form-register .show_if_seller");
    if (dokan_if_seller.length) {
        var wc_form = jQuery(".woocommerce-form-register");
        if (wc_form.find('#dig_cs_name').length) {
            wc_form.find("#first-name").closest('.form-row').remove();
        }
        if (wc_form.find('#dig_cs_lastname').length) {
            wc_form.find("#last-name").closest('.form-row').remove();
        }
        if (dig_mdet.mobile_accept > 0) {
            wc_form.find("#shop-phone").closest('.form-row').remove();
        }
    }


    //next social
    setTimeout(function () {
        var form = jQuery('.digits_login_form').find('#nsl-custom-login-form-2');
        if (form.length) {
            form.parent().append(form);
        }
    }, 500);


    if (dig_mdet.secure_forms) {
        var wc_login_form = jQuery('.woocommerce-form-login');
        if (wc_login_form.length) {
            wc_login_form.find('input[type="password"]').closest('.form-row').remove();
            var wc_login_submit = wc_login_form.find('[type="submit"]');
            var lost_password = wc_login_form.find('.lost_password');
            var last_wc_submit = wc_login_submit.last().closest('.form-row');
            lost_password.appendTo(last_wc_submit);
            var last_wc_submit_index = last_wc_submit.index() + 1
            if (last_wc_submit_index == 0) {
                last_wc_submit_index = 1;
            }
            wc_login_form.children().slice(0, last_wc_submit_index).wrapAll(secure_wrap);

            wc_login_submit.remove();
        }

        var wp_login_form = jQuery(".wp_login");
        if (wp_login_form.length) {
            wp_login_form.find('input[type="password"]').closest('.user-pass-wrap').remove();
            wp_login_form.wrapInner(secure_wrap);
            var wp_login_form_section = wp_login_form.find('.form_last_section');
            wp_login_form.find('[type="submit"]').remove();
            wp_login_form_section.appendTo(wp_login_form);
        }

        var ihc_secure_login_form = jQuery("#ihc_login_form");
        if (ihc_secure_login_form.length) {
            ihc_secure_login_form.addClass('digits_form_index_section');
            ihc_secure_login_form.find('input[type="password"]').closest('.impu-form-line-fr').remove();
            ihc_secure_login_form.find('input').first().nextUntil('.ihc-clear').next().andSelf().wrapAll(secure_wrap);
            var ihc_secure_login_form_submit = ihc_secure_login_form.find('.impu-form-submit');
            ihc_secure_login_form_submit.empty();
            ihc_secure_login_form_submit.append(jQuery('#digits_ihc_form_secure_login').html());
            var ihc_secure_login_uname_wrap = ihc_secure_login_form.find('.digcon');
            ihc_secure_login_uname_wrap.find('.countrycode').attr('name', 'digt_countrycode');
            ihc_secure_login_uname_wrap.find('#iump_login_username').attr('id', 'user_login');
            var ihc_captcha = ihc_secure_login_form.find('.digits_captcha_row').first();
            ihc_captcha.insertBefore(ihc_secure_login_form.find('.impu-remember-wrapper'));
        }

        jQuery(document).on('click', '.digits_secure_login-tp', function (e) {
            e.preventDefault();
            var $this = jQuery(this);
            var form = $this.closest('form');
            form.removeAttr('action');
            var username = form.find('#username');
            if (!username.length) {
                username = form.find('#user_login');
            }
            update_login_action_type(form, username);
            window.digitsSecureFormSubmit(form);
            return false;
        })

        function update_login_action_type(form, login_user_inp) {
            var login_type = 'email';
            var update_login_field = 'digits_email';
            var login_user = login_user_inp.val();
            if (is_mobile(login_user)) {
                login_type = 'phone';
                update_login_field = 'digits_phone';
            }
            form.addClass('digits-tp_style');
            form.find('[name="action_type"]').val(login_type);
            form.find('[name="' + update_login_field + '"]').val(login_user);
        }

        jQuery(window).trigger('digits_auto_login');
    }

});

function verifyOTPbilling(sen) {
    if (sen === 10) {
        jQuery(document).trigger('digits_process_wc_checkout');
        return;
    }
    var l;
    if (sen == 2) {
        l = document.getElementById('dig_billing_signupwithpassword');
    } else {
        l = document.getElementById('dig_billing_validate_button');
    }
    l.click();

}
