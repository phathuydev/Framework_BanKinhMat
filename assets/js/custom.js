const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const url_product = 'http://localhost:3000/products';
const url_category = 'http://localhost:3000/categories';
const url_user = 'http://localhost:3000/users';
const url_questions = 'http://localhost:3000/questions';
const url_answer = 'http://localhost:3000/answer';
const getUserId = localStorage.getItem("userId");
const getUserName = localStorage.getItem("userName");

// Định nghĩa AngularJs
var app = angular.module('myProduct', ['ngRoute', 'angularUtils.directives.dirPagination']);

// Khởi chạy 1 khối mã khi trang web được khơi tạo
app.run(function ($rootScope, $http) {
  // Hàm để lấy tất cả các danh mục
  $rootScope.getAllCategories = function () {
    return $http.get(url_category)
      .then(function (res) {
        $rootScope.categories = res.data;
      });
  };

  // Hàm để lấy tất cả sản phẩm trong một danh mục
  $rootScope.getProdCategory = function (categoryId) {
    return $http.get(url_product + '?category=' + categoryId)
      .then(function (res) {
        $rootScope.prodCategory = res.data;
      });
  };

  // Hàm để lấy thông tin của một sản phẩm cụ thể
  $rootScope.getProductOne = function (productId) {
    return $http.get(url_product + '/' + productId)
      .then(function (res) {
        $rootScope.getProduct = res.data;
        $rootScope.productName = res.data.name;
        $rootScope.productPrice = res.data.price;
        $rootScope.productCategory = res.data.category;
        $rootScope.productTop = res.data.top;
        $rootScope.productNew = res.data.new;
        $rootScope.productDescribe = res.data.describe;
      });
  };

  // Hàm để chuyển hướng đến trang chi tiết sản phẩm và làm tải lại trang
  $rootScope.headerDetail = function (productId) {
    window.location.href = '#!detail/' + productId;
    window.location.reload();
  };

  // Hàm để lấy tất cả sản phẩm và phân loại các sản phẩm
  $rootScope.getAllPrd = function () {
    return $http.get(url_product).then(function (res) {
      $rootScope.product = res.data;
      // Lấy 3 sản phẩm bán chạy trong kho
      $rootScope.topProducts = $rootScope.product.filter(function (product) {
        return product.top == 1;
      });
      // Lấy tất cả sản phẩm mới trong kho
      $rootScope.newProducts = $rootScope.product.filter(function (product) {
        return product.new == 1;
      });
    });
  };

  // Hàm để đăng nhập và lưu thông tin người dùng vào localStorage
  $rootScope.signin = function (username, password) {
    $http.get(url_user + '?name=' + username + '&password=' + password).then(res => {
      var getUserSignined = res.data;
      if (getUserSignined && getUserSignined.length > 0 && getUserSignined[0].name && getUserSignined[0].password) {
        // Set thời gian tồn tại của localStorage userId
        localStorage.setItem("userId", getUserSignined[0].id);
        localStorage.setItem("userName", getUserSignined[0].name);
        window.location.href = "index.html";
      } else {
        alert('Tài khoản không tồn tại');
      };
    });
  };

  // Kiểm tra xem người dùng đã đăng nhập hay chưa
  $rootScope.issetUserId = getUserId ? true : false;

  // Giá trị tìm kiếm ban đầu là rỗng
  $rootScope.search = '';
});

// Trang chủ
app.controller('HomeController', function ($rootScope) {
  $rootScope.title = 'Trang Chủ';
  $rootScope.getAllPrd();
});

// Sản phẩm
app.controller('ShopController', function ($rootScope) {
  $rootScope.title = 'Sản Phẩm';
  var vm = this;
  // Lấy tất cả sản phẩm
  vm.getAllProduct = function () {
    $rootScope.getAllPrd();
    vm.showCategoryProduct = false;
    vm.showAllProduct = true;
    vm.allActive = true;
    vm.activeCategoryId = null;
  }
  // Hien thi tat ca san pham
  vm.getAllProduct();
  // Lấy sản phẩm theo category id
  vm.showProductCategory = function (category_id) {
    $rootScope.getProdCategory(category_id);
    vm.showCategoryProduct = true;
    vm.showAllProduct = false;
    vm.allActive = false;
    vm.activeCategoryId = category_id;
  }
  // Gán active cho loại
  vm.isActive = function (category_id) {
    return vm.activeCategoryId === category_id;
  }
  // Lọc sản phẩm
  vm.sortBy = 'image';
  $rootScope.$watch('sortBy', function (newValue) {
    if (newValue === 'price') {
      vm.sortBy = 'price';
    } else if (newValue === '-price') {
      vm.sortBy = '-price';
    } else if (newValue === 'name') {
      vm.sortBy = 'name';
    } else if (newValue === '-name') {
      vm.sortBy = '-name';
    }
  });
  $rootScope.getAllCategories();
});

// Chi tiết sản phẩm
app.controller('DetailController', function ($routeParams, $http, $rootScope) {
  $rootScope.title = 'Chi Tiết Sản Phẩm';
  var vm = this;
  // Lấy sản phẩm chi tiết
  $http.get(url_product + '/' + $routeParams.id)
    .then(function (res) {
      vm.detailProduct = res.data;
      // Lấy tên loại
      var categoryId = vm.detailProduct.category;
      $http.get(url_category + '?id=' + categoryId)
        .then(function (res) {
          vm.categoryName = res.data[0].name;
        });
      // Lấy các sản phẩm liên quan
      $rootScope.getProdCategory(categoryId);
    });
});

// Giới thiệu
app.controller('AboutController', function ($rootScope) {
  $rootScope.title = 'Giới Thiệu';
});

// Liên hệ
app.controller('ContactController', function ($rootScope) {
  $rootScope.title = 'Liên Hệ';
});

// Khảo sát
app.controller('SurveyController', function ($rootScope, $http) {
  $rootScope.title = 'Khảo Sát';
  var vm = this;
  // Bắt đầu mở khảo sát
  vm.inProgess = false;
  vm.start = function () {
    vm.id = 0;
    vm.inProgess = true;
    getQuestion();
  };
  getQuestion = function () {
    getQueAndAns(vm.id);
  }
  getQueAndAns = function (index) {
    $http.get(url_questions).then(function (res) {
      var ques = res.data;
      vm.countQues = ques.length;
      if (ques) {
        vm.questions = ques[index].question;
        vm.options = ques[index].answer;
      }
    });
  }
  var questionss = [];
  var answers = [];
  vm.nextQuestion = function () {
    if (!$('input[name=answer]:checked')) {
      alert('Vui lòng chọn câu trả lời!');
    } else {
      var ans = $('input[name=answer]:checked').value;
      var que = $('input[name=que]').value;
      questionss.push(que);
      answers.push(ans);
      if (vm.id < 2) {
        vm.id++;
        getQuestion();
      } else {
        if (getUserId) {
          answerData = {
            userAnswer: getUserId,
            question: questionss,
            answer: answers
          }
          $http.post(url_answer, answerData).then(res => {
            alert('Cảm ơn bạn đã làm khảo sát của chúng tôi!');
          });
        } else {
          answerData = {
            question: questionss,
            answer: answers
          }
          $http.post(url_answer, answerData).then(res => {
            alert('Cảm ơn bạn đã làm khảo sát của chúng tôi!');
          });
        };
      };
    };
  };
});

// Hồ sơ
app.controller('ProfileController', function ($rootScope, $http) {
  $rootScope.title = 'Hồ Sơ';
  var vm = this;
  if (!getUserId || !getUserName) {
    window.location.href = "#!home";
  }
  vm.signout = function () {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    location.reload(true);
  }
  $http.get(url_user + '/' + getUserId).then(res => {
    vm.userInfo = res.data;
  });
  vm.updateProfile = function () {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    vm.usernameErr = '';
    vm.emailErr = '';
    if (!vm.userInfo.name) {
      vm.usernameErr = 'Không để trống tên đăng nhập';
      return false;
    } else if (!vm.userInfo.email) {
      vm.emailErr = 'Không để trống email';
      return false;
    } else if (!emailRegex.test(vm.userInfo.email)) {
      vm.emailErr = 'Email sai định dạng';
      return false;
    }
    var getUserSuccess = false;
    updatedProfile = function () {
      var userUpdateData = {
        name: vm.userInfo.name,
        email: vm.userInfo.email,
      };
      $http.patch(url_user + '/' + getUserId, userUpdateData)
        .then(res => {
          alert('Cập Nhật Hồ Sơ Thành Công');
        });
    }
    $http.get(url_user + '?name=' + vm.userInfo.name).then(res => {
      var getUserSignin = res.data;
      // Kiểm tra xem get được chưa
      if (getUserSignin.length > 0 && getUserSignin[0].name) {
        getUserSuccess = true;
      }
      // Nếu không tìm thấy username thì cập nhật username mới cho user.
      if (!getUserSuccess) {
        updatedProfile();
      } else {
        // Kiểm tra nếu username bằng username lưu trên local thì vẫn cập nhật.
        if (getUserSignin.length > 0 && getUserSignin[0].name === getUserName) {
          updatedProfile();
        } else {
          // Nếu thấy username trùng với username khác thì thông báo
          alert('Tên đăng nhập đã tồn tại');
        }
      }
    });
  };

  vm.updatePassword = function () {
    vm.passwordOldErr = '';
    vm.newpasswordErr = '';
    vm.cNewPasswordErr = '';
    if (!vm.passwordOld) {
      vm.passwordOldErr = 'Vui lòng nhập mật khẩu hiện tại';
      return false;
    } else if (vm.passwordOld !== vm.userInfo.password) {
      vm.passwordOldErr = 'Mật khẩu hiện tại không chính xác';
      return false;
    } else if (!vm.newPassword) {
      vm.newpasswordErr = 'Vui lòng nhập mật khẩu mới';
      return false;
    } else if (!vm.cNewPassword) {
      vm.cNewPasswordErr = 'Vui lòng nhập lại mật khẩu mới';
      return false;
    } else if (vm.newPassword !== vm.cNewPassword) {
      vm.cNewPasswordErr = 'Mật khẩu nhập lại chưa khớp';
      return false;
    }
    var newPasswordData = {
      password: vm.newPassword,
    };
    $http.patch(url_user + '/' + getUserId, newPasswordData)
      .then(res => {
        alert('Cập Nhật Mật Khẩu Mới Thành Công');
      });
  }
});

// Đăng nhập
app.controller('SigninController', function ($rootScope) {
  $rootScope.title = 'Đăng Nhập';
  var vm = this;
  if (getUserId && getUserName) {
    window.location.href = "#!home";
  } else {
    vm.signin = function () {
      vm.usernameErr = '';
      vm.productNameErr = '';
      if (!vm.username) {
        vm.usernameErr = 'Vui lòng không để trống tên đăng nhập';
        return false;
      } else if (!vm.password) {
        vm.passwordErr = 'Vui lòng không để trống mật khẩu';
        return false;
      }
      // Gọi hàm đăng nhập
      $rootScope.signin(vm.username, vm.password);
    };
  };
});

// Đăng ký 
app.controller('SignupController', function ($rootScope, $http) {
  $rootScope.title = 'Đăng Ký';
  var vm = this;
  if (getUserId && getUserName) {
    window.location.href = "#!home";
  } else {
    vm.signup = function () {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      vm.usernameErr = '';
      vm.productNameErr = '';
      vm.emailErr = '';
      vm.passwordErr = '';
      vm.cpasswordErr = '';
      if (!vm.username) {
        vm.usernameErr = 'Vui lòng không để trống tên đăng nhập';
        return false;
      } else if (!vm.email) {
        vm.emailErr = 'Vui lòng không để trống email';
        return false;
      } else if (!emailRegex.test(vm.email)) {
        vm.emailErr = 'Email sai định dạng';
        return false;
      } else if (!vm.password) {
        vm.passwordErr = 'Vui lòng không để trống mật khẩu';
        return false;
      } else if (!vm.cpassword) {
        vm.cpasswordErr = 'Vui lòng nhập lại mật khẩu';
        return false;
      } else if (vm.password !== vm.cpassword) {
        vm.cpasswordErr = 'Mật khẩu chưa khớp';
        return false;
      }
      // Thực hiện chức năng đăng ký tài khoản
      $http.get(url_user + '?name=' + vm.username).then(res => {
        if (res.data && res.data.length > 0 && res.data[0].name) {
          alert('Tên đăng nhập đã tồn tại');
        } else {
          var dataUser = {
            name: vm.username,
            email: vm.email,
            password: vm.password,
          };
          $http.post(url_user, dataUser).then(res => {
            alert('Đăng ký thành công');
            // Gọi hàm đăng nhập
            $rootScope.signin(vm.username, vm.password);
          });
        }
      });
    };
  };
});

// Xem và thêm sản phẩm
app.controller('AddProductController', function ($http, $rootScope) {
  var vm = this;
  if (!getUserId || !getUserName) {
    alert('Vui lòng đăng nhập trước khi thực hiện hành động này!');
    window.location.href = "#!signin";
  } else {
    $rootScope.title = 'Thêm Sản Phẩm';
    $rootScope.getAllCategories();
    // Lấy tất cả sản phẩm show ra table
    $http.get(url_product)
      .then(function (res) {
        vm.getAllProduct = res.data;
        vm.productCategories = {};
        vm.getAllProduct.forEach(function (product) {
          $http.get(url_category + '?id=' + product.category)
            .then(function (res) {
              vm.productCategories[product.category] = res.data[0].name;
            });
        });
      });
    // Sự kiện sắp xếp dữ liệu trong bảng
    vm.changeSortByTable = function (sortByTable) {
      if (vm.sortByTable === sortByTable) {
        vm.sortByTable = '-' + sortByTable;
      } else {
        vm.sortByTable = sortByTable;
      }
    }
    // Thêm icon
    vm.getSortIcon = function (sortByTable) {
      if (vm.sortByTable === sortByTable) {
        return 'fa-caret-up ms-1';
      }
      return 'fa-caret-down ms-1';
    };
    // Thêm sản phẩm
    vm.addProduct = function () {
      var productImage = $('#imageShow').getAttribute('src');
      vm.productImageErr = '';
      vm.productNameErr = '';
      vm.productPriceErr = '';
      vm.productCategoryErr = '';
      vm.productTopErr = '';
      vm.productNewErr = '';
      vm.productDescribeErr = '';
      if (!productImage) {
        vm.productImageErr = 'Vui lòng thêm ảnh sản phẩm';
        return false;
      } else if (!vm.productName) {
        vm.productNameErr = 'Vui lòng nhập tên sản phẩm';
        return false;
      } else if (!vm.productPrice) {
        vm.productPriceErr = 'Vui lòng thêm giá sản phẩm';
        return false;
      } else if (vm.productPrice <= 0) {
        vm.productPriceErr = 'Giá tiền phải lớn hơn 0';
        return false;
      } else if (!vm.productCategory) {
        vm.productCategoryErr = 'Vui lòng chọn loại sản phẩm';
        return false;
      } else if (!vm.productTop) {
        vm.productTopErr = 'Vui lòng chọn có hoặc không';
        return false;
      } else if (!vm.productNew) {
        vm.productNewErr = 'Vui lòng chọn có hoặc không';
        return false;
      } else if (!vm.productDescribe) {
        vm.productDescribeErr = 'Vui lòng thêm mô tả sản phẩm';
        return false;
      } else {
        vm.productData = {
          name: vm.productName,
          image: productImage,
          price: vm.productPrice,
          category: vm.productCategory,
          top: vm.productTop,
          new: vm.productNew,
          describe: vm.productDescribe
        };
        $http.post(url_product, vm.productData)
          .then(res => {
            alert('Thêm Sản Phẩm Thành Công');
          })
      };
    };
    // Xóa dữ liệu trong form
    vm.resetForm = function () {
      $('#imageShow').src = '';
      const form = $('#form');
      form.reset();
    }
    // Xóa sản phẩm
    vm.deleteProduct = function (productId) {
      var confirmDelete = confirm('Bạn Có Chắc Chắn Muốn Xóa Sản Phẩm Này?');
      if (confirmDelete) {
        $http.delete(url_product + '/' + productId)
          .then(res => {
            alert('Xóa sản phẩm thành công');
          });
      }
    };
  }
});

// Cập nhật sản phẩm
app.controller('UpdateProductController', function ($scope, $rootScope, $routeParams, $http) {
  if (!getUserId || !getUserName) {
    window.location.href = "#!home";
  } else {
    $rootScope.title = 'Cập Nhật Sản Phẩm';
    var vm = this;
    $rootScope.getProductOne($routeParams.id);
    $rootScope.getAllCategories();
    // Sửa sản phẩm
    vm.updateProduct = function () {
      var productImage = $('#imageShow').getAttribute('src');
      vm.productNameUpdateErr = '';
      vm.productPriceUpdateErr = '';
      vm.productDescribeUpdateErr = '';
      if (!$scope.productName) {
        vm.productNameUpdateErr = 'Vui lòng nhập tên sản phẩm';
        return false;
      } else if (!$scope.productPrice) {
        vm.productPriceUpdateErr = 'Vui lòng thêm giá sản phẩm';
        return false;
      } else if ($scope.productPrice <= 0) {
        vm.productPriceUpdateErr = 'Giá tiền phải lớn hơn 0';
        return false;
      } else if (!$scope.productDescribe) {
        vm.productDescribeUpdateErr = 'Vui lòng thêm mô tả sản phẩm';
        return false;
      }
      var productDataUpdate = {
        name: $scope.productName,
        image: productImage,
        price: $scope.productPrice,
        category: $scope.productCategory,
        top: $scope.productTop,
        new: $scope.productNew,
        describe: $scope.productDescribe
      };
      $http.patch(url_product + '/' + $routeParams.id, productDataUpdate)
        .then(res => {
          alert('Cập Nhật Sản Phẩm Thành Công');
          window.location.href = '#!admin';
        });
    };
  };
});

// Route
app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: './views/home/home.html?' + Math.random(),
      controller: 'HomeController'
    })
    .when('/shop', {
      templateUrl: './views/shop/shop.html?' + Math.random(),
      controller: 'ShopController',
      controllerAs: 'Shop'
    })
    .when('/detail/:id', {
      templateUrl: './views/shop/detail.html?' + Math.random(),
      controller: 'DetailController',
      controllerAs: 'Detail'
    })
    .when('/about', {
      templateUrl: './views/about/about.html?' + Math.random(),
      controller: 'AboutController'
    })
    .when('/contact', {
      templateUrl: './views/contact/contact.html?' + Math.random(),
      controller: 'ContactController'
    })
    .when('/profile', {
      templateUrl: './views/profile/profile.html?' + Math.random(),
      controller: 'ProfileController',
      controllerAs: 'Profile'
    })
    .when('/survey', {
      templateUrl: './views/survey/survey.html?' + Math.random(),
      controller: 'SurveyController',
      controllerAs: 'Survey'
    })
    .when('/signin', {
      templateUrl: './views/auth/signin.html?' + Math.random(),
      controller: 'SigninController',
      controllerAs: 'Signin'
    })
    .when('/signup', {
      templateUrl: './views/auth/signup.html?' + Math.random(),
      controller: 'SignupController',
      controllerAs: 'Signup'
    })
    .when('/admin', {
      templateUrl: './views/admin/addProduct.html?' + Math.random(),
      controller: 'AddProductController',
      controllerAs: 'Admin'
    })
    .when('/update/:id', {
      templateUrl: './views/admin/updateProduct.html?' + Math.random(),
      controller: 'UpdateProductController',
      controllerAs: 'Update'
    })
    .otherwise({
      redirectTo: '/'
    });
});