'use strict';

describe('ngI18nService', function () {
    var ngI18nConfig, windowStub;
    beforeEach(function () {

        module('ngI18nConfig');

        module(function ($provide) {
            ngI18nConfig = {supportedLocales:['nl', 'en']};
            $provide.value('ngI18nConfig', ngI18nConfig);

            windowStub = {
                navigator:{
                    language:undefined,
                    userLanguage:undefined
                }

            };
            $provide.value('$window', windowStub);
        });

        module('ngI18nService');

    });

    describe('ngI18nResourceBundle', function () {
        var $httpBackend, ngI18nResourceBundle, expectedResourceBundle, resourceBundle;

        beforeEach(inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            ngI18nResourceBundle = $injector.get('ngI18nResourceBundle');
            expectedResourceBundle = {"key1":'value1', "key2":'value2'};
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it("should be able to get resourceBundle for locale set in options", function () {
            assertResourceBundleLoaded('nl');
        });

        describe('Locale from browser', function () {
            it("should be able to get resourceBundle for Locale from browser (non IE) when locale not set in options", function () {
                var locale = 'fr';
                ngI18nConfig.supportedLocales = [locale];
                windowStub.navigator.language = locale;
                assertResourceBundleLoadedWithLocaleFromBrowser(locale);
            });

            it("should be able to get resourceBundle for Locale from browser (IE) when locale not set in options", function () {
                var locale = 'fr';
                ngI18nConfig.supportedLocales = [locale];
                windowStub.navigator.userLanguage = locale;
                assertResourceBundleLoadedWithLocaleFromBrowser(locale);
            });

            function assertResourceBundleLoadedWithLocaleFromBrowser(locale) {
                $httpBackend.when("GET", '/i18n/resourceBundle_' + locale + '.json').respond(expectedResourceBundle);

                ngI18nResourceBundle.get().success(function (data) {
                    resourceBundle = data;
                });

                $httpBackend.flush();

                expect(resourceBundle).toEqual(expectedResourceBundle);
            }
        });

        describe('base path', function () {
            it("should be able to configure base path for url", function () {
                ngI18nConfig.basePath = 'new/base/path';
                var basePath = 'new/base/path';
                assertResourceBundleLoaded('nl', basePath);
            });
        });

        describe('supported locales', function () {
            it("should be able to fallback to default resourceBundle when locale not supported", function () {
                ngI18nConfig.supportedLocales = ['nl', 'en'];
                assertDefaultResourceBundleLoaded('fr');
            });

            it("should be able to fallback to resourceBundle for language from Locale when language of locale is supported but locale not", function () {
                ngI18nConfig.supportedLocales = ['nl', 'en'];
                assertResourceBundleLoadedForSupportedLocales('nl-be', 'nl');
            });

            function assertResourceBundleLoadedForSupportedLocales(localeForGet, localeForUrl) {
                $httpBackend.when("GET", '/i18n/resourceBundle_' + localeForUrl + '.json').respond(expectedResourceBundle);

                ngI18nResourceBundle.get({locale:localeForGet}).success(function (data) {
                    resourceBundle = data;
                });

                $httpBackend.flush();

                expect(resourceBundle).toEqual(expectedResourceBundle);
            }
        });

        describe('default locale', function () {
            it('should get default resourceBundle when locale matches default locale', function () {
                ngI18nConfig.supportedLocales = ['nl', 'en'];
                ngI18nConfig.defaultLocale = 'nl';
                assertDefaultResourceBundleLoaded('nl');
            });
        });

        function assertResourceBundleLoaded(locale, basePath) {
            var _basePath = basePath || 'i18n';
            $httpBackend.when("GET", '/' + _basePath + '/resourceBundle_' + locale + '.json').respond(expectedResourceBundle);

            ngI18nResourceBundle.get({locale:locale}).success(function (data) {
                resourceBundle = data;
            });

            $httpBackend.flush();

            expect(resourceBundle).toEqual(expectedResourceBundle);
        }

        function assertDefaultResourceBundleLoaded(locale) {
            $httpBackend.when("GET", '/i18n/resourceBundle.json').respond(expectedResourceBundle);

            ngI18nResourceBundle.get({locale:locale}).success(function (data) {
                resourceBundle = data;
            });

            $httpBackend.flush();

            expect(resourceBundle).toEqual(expectedResourceBundle);
        }
    });

});
