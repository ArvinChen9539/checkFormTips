/**
 * Created by 9550 on 2017/3/22.
 */

angular.module('checkFormTips', []).value('VALID_MSG', {
    required: "这是必填字段",
    remote: "请修正此字段",
    email: "请输入有效的电子邮件地址",
    url: "请输入有效的网址",
    date: "请输入有效的日期",
    dateISO: "请输入有效的日期 (YYYY-MM-DD)",
    number: "请输入有效的数字",
    digits: "只能输入数字",
    creditcard: "请输入有效的信用卡号码",
    equalTo: "你的输入不相同",
    extension: "请输入有效的后缀",
    /*maxlength: "最多可以输入 {0} 个字符",*/
    minlength: "最少要输入 {0} 个字符",
    rangelength: "请输入长度在 {0} 到 {1} 之间的字符串",
    range: "请输入范围在 {0} 到 {1} 之间的数值",
    max: "请输入不大于 {0} 的数值",
    min: "请输入不小于 {0} 的数值",
    pattern: "请输入有效的字符",
    confirmPassword: "两次密码输入不一致",
    maxlength: function (num) {
        return _.isNumber(num) ? '不能超过' + num + '个字符' : num;
    },
    defaultMsg: '请按要求填写!'
}).controller('checkTipsHomeCtrl', ['$scope', function ($scope) {
//监听触发错误信息提示
    $scope.$watch('checkForm', function (data) {
        if ($scope.myForm) {
            //触发表单监测
            $.each($scope.myForm, function (index, item) {
                if (index.substr(0, 1) != '$') {
                    item.$flag = !item.$flag;
                }
            });
        }
    });
    this.scope = $scope;
}]).directive('checkTipsHome', ['$rootScope', function ($rootScope) {
    return {
        priority: 100,
        scope: {
            myForm: '=',//表单对象
            checkForm: '=',//改变这个值可以触发所有的表单立即校验并弹出提示
            submited: '=',//用来第一次进入页面判断参数是否合法
        },
        controller: 'checkTipsHomeCtrl'
    };
}]).directive('checkLayerTips', ['$timeout', 'VALID_MSG',
    function ($timeout, VALID_MSG) {
        return {
            restrict: 'AC',
            require: '^?checkTipsHome',
            scope: {
                ngModel: '=',
                msgOptions: '=',//自定义提示信息
                selectAll: '@'
            },
            link: function (scope, ele, attrs, parent) {
                if (scope.selectAll) {
                    //点击时选中所有文本
                    ele.bind("click", function (event) {//点击时，选中
                        this.select();
                    });
                }
                //获取表单form对象
                if (!parent.scope) {
                    return;
                }
                scope.checkOptions = parent.scope.myForm[attrs.name];

                /**
                 * 检查表单数据
                 */
                scope.checkValue = function () {
                    //判断是否有错误信息
                    if (scope.checkOptions && (scope.checkOptions.$dirty || parent.scope.submited) && scope.checkOptions.$invalid) {
                        var msg = '数据异常';
                        //查询错误信息
                        $.each(scope.checkOptions.$error, function (index, item) {
                            if (item) {
                                //读取用户配置信息
                                if (scope.msgOptions && scope.msgOptions[index]) {
                                    msg = scope.msgOptions[index];
                                } else {
                                    //读取系统默认信息配置
                                    if (VALID_MSG[index]) {
                                        if (_.isFunction(VALID_MSG[index])) {
                                            msg = VALID_MSG[index](attrs.ngMaxlength);
                                        } else {
                                            msg = VALID_MSG[index];
                                        }
                                    }
                                }

                            }
                        });
                        //加载完成后再执行
                        $timeout(function () {
                            if (!scope.isInit) {
                                scope.style = ele.attr('style');
                                if (scope.style === undefined) {//修复样式为undefined时校验回复不了原来的颜色的问题
                                    scope.style = '';
                                }
                                scope.isInit = true;
                                scope.tips = '';
                            }
                            //关闭之前的tips
                            layer.close(scope.tips);
                            scope.tips = layer.tips(msg, ele, {
                                tips: [1, 'red'],
                                tipsMore: true,
                                time: 3000
                            });
                            ele.attr('style', scope.style + ';border-color: red');
                        });
                    } else {
                        //验证通过立即关闭提示
                        $timeout(function () {
                            ele.attr('style', scope.style);
                            layer.close(scope.tips);
                        });
                    }
                };

                /**
                 * 失去焦点时校验
                 */
                angular.element(ele).on('blur', (function (data) {
                    scope.checkValue();
                }));

                //监听用户输入
                scope.$watch('checkOptions.$flag', function (data) {
                    scope.checkValue();
                }, true);
            }
        };
    }]);