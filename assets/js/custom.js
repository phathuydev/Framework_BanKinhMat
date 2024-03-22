const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const url_product = 'http://localhost:3000/products';
const url_category = 'http://localhost:3000/categories';
const url_user = 'http://localhost:3000/users';
const url_questions = 'http://localhost:3000/questions';
const url_answer = 'http://localhost:3000/answer';
// Lấy userId từ localStorage
const getUserId = localStorage.getItem("userId");
const userIdData = JSON.parse(getUserId);
// Set src cho thẻ img khi select ảnh form thêm
function previewFile() {
  const preview = $("#imageShow");
  const file = $("#imageProduct").files[0];
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      preview.src = reader.result;
    },
    false
  );
  if (file) {
    reader.readAsDataURL(file);
  }
}
// Set src cho thẻ img khi select ảnh form add
function previewFileUpdate() {
  const preview = $("#imageShowUpdate");
  const file = $("#imageProductUpdate").files[0];
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      preview.src = reader.result;
    },
    false
  );
  if (file) {
    reader.readAsDataURL(file);
  }
}
// Set item, value, thời gian hết hạn cho localStorage
function setWithExpiry(key, value, ttl) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl // Thời gian hết hạn
  };
  localStorage.setItem(key, JSON.stringify(item));
}
// Xóa localStorage UserId khi quá thời gian set
function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  // Nếu không có mục nào với key hoặc đã hết hạn, trả về null
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  // Nếu thời gian hết hạn, xóa mục và trả về null
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}
// Gọi hàm xóa localStorage UserId
getWithExpiry("userId");
// AngularJs
var app = angular.module('myProduct', ['ngRoute', 'angularUtils.directives.dirPagination']);
app.controller('HomeController', function ($scope, $rootScope, $http) {
  $rootScope.title = 'Trang Chủ';
  $rootScope.homeActive = true;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  $http.get(url_product).then(res => {
    $rootScope.productSearch = res.data;
  });
  // Lấy tất cả sản phẩm
  $http.get(url_product).then(function (res) {
    $scope.product = res.data;
    // Lấy 3 sản phẩm bán chạy trong kho
    $scope.topProducts = $scope.product.filter(function (product) {
      return product.top == 1;
    });
    // Lấy tất cả sản phẩm mới trong kho
    $scope.newProducts = $scope.product.filter(function (product) {
      return product.new == 1;
    });
  });
}).controller('ShopController', function ($scope, $http, $rootScope) {
  $rootScope.title = 'Sản Phẩm';
  $rootScope.homeActive = null;
  $rootScope.shopActive = true;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  // Lấy danh mục sản phẩm
  $http.get(url_category)
    .then(function (res) {
      $rootScope.categories = res.data;
    });
  // Lấy tất cả sản phẩm
  getAllProduct = function () {
    $http.get(url_product).then(function (res) {
      $scope.allProduct = res.data;
      $scope.showCategoryProduct = false;
      $scope.showAllProduct = true;
      $scope.allActive = true;
      $scope.activeCategoryId = null;
    });
  }
  // Lấy tất cả sản phẩm
  $scope.showAllProducts = function () {
    getAllProduct();
  }
  // Lấy sản phẩm theo category id
  $scope.showProductCategory = function (category_id) {
    $http.get(url_product + '?category=' + category_id).then(function (res) {
      $http.get(url_product).then(res => {
        $rootScope.productSearch = res.data;
      });
      $scope.productCategory = res.data;
      $scope.showCategoryProduct = true;
      $scope.showAllProduct = false;
      $scope.allActive = false;
      $scope.activeCategoryId = category_id;
    });
  }
  // Gán active cho loại
  $scope.isActive = function (category_id) {
    return $scope.activeCategoryId === category_id;
  }
  // Lọc sản phẩm
  $scope.sortBy = 'image';
  $scope.$watch('sortBy', function (newValue) {
    if (newValue === 'price') {
      $scope.sortBy = 'price';
    } else if (newValue === '-price') {
      $scope.sortBy = '-price';
    } else if (newValue === 'name') {
      $scope.sortBy = 'name';
    } else if (newValue === '-name') {
      $scope.sortBy = '-name';
    }
  });
  getAllProduct();
}).controller('DetailController', function ($scope, $routeParams, $http, $rootScope) {
  $rootScope.title = 'Chi Tiết Sản Phẩm';
  $rootScope.homeActive = null;
  $rootScope.shopActive = true;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  $http.get(url_product + '/' + $routeParams.id)
    .then(function (res) {
      $scope.detailProduct = res.data;
      // Lấy tên loại
      var categoryId = $scope.detailProduct.category;
      $http.get(url_category + '?id=' + categoryId)
        .then(function (res) {
          $scope.categoryName = res.data[0].name;
        });
      // Lấy các sản phẩm liên quan
      $http.get(url_product + '?category=' + categoryId)
        .then(function (res) {
          $scope.relatedProduct = res.data;
        });
    });
}).controller('AboutController', function ($scope, $rootScope) {
  $rootScope.title = 'Giới Thiệu';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = true;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
}).controller('ContactController', function ($scope, $rootScope) {
  $rootScope.title = 'Liên Hệ';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = true;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
}).controller('SurveyController', function ($scope, $rootScope, $http) {
  $rootScope.title = 'Khảo Sát';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = true;
  $rootScope.authActive = null;
  $scope.start = function () {
    $scope.id = 0;
    $scope.inProgess = true;
    $scope.getQuestion();
  };
  $scope.reset = function () {
    $scope.inProgess = false;
  };
  $scope.getQuestion = function () {
    $scope.getQueAndAns($scope.id);
  }
  $scope.getQueAndAns = function (index) {
    $http.get(url_questions).then(function (res) {
      $scope.ques = res.data;
      $scope.countQues = $scope.ques.length;
      if ($scope.ques) {
        $scope.questions = $scope.ques[index].question;
        $scope.options = $scope.ques[index].answer;
      }
    });
    $scope.answerMode = true;
  }
  $scope.questionss = [];
  $scope.answers = [];
  $scope.nextQuestion = function () {
    if (!$('input[name=answer]:checked')) {
      alert('Vui lòng chọn câu trả lời!');
    } else {
      var ans = $('input[name=answer]:checked').value;
      var que = $('input[name=que]').value;
      $scope.questionss.push(que);
      $scope.answers.push(ans);
      if ($scope.id < 2) {
        $scope.id++;
        $scope.getQuestion();
      } else {
        if (userIdData) {
          answerData = {
            userAnswer: userIdData.value,
            question: $scope.questionss,
            answer: $scope.answers
          }
          $http.post(url_answer, answerData).then(res => {
            alert('Cảm ơn bạn đã làm khảo sát của chúng tôi!');
          });
        } else {
          answerData = {
            question: $scope.questionss,
            answer: $scope.answers
          }
          $http.post(url_answer, answerData).then(res => {
            alert('Cảm ơn bạn đã làm khảo sát của chúng tôi!');
          });
        }
      }
    }
  }
  $scope.reset();
}).controller('ProfileController', function ($scope, $rootScope, $http) {
  $rootScope.title = 'Hồ Sơ';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  if (!getUserId) {
    window.location.href = "#!home";
  }
  $scope.signout = function () {
    localStorage.removeItem('userId');
    location.reload(true);
  }
  $http.get(url_user + '/' + userIdData.value).then(res => {
    $scope.userInfo = res.data;
  });
  $scope.updateProfile = function () {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    $scope.usernameErr = '';
    $scope.emailErr = '';
    if (!$scope.userInfo.name) {
      $scope.usernameErr = 'Không để trống tên đăng nhập';
      return false;
    } else if (!$scope.userInfo.email) {
      $scope.emailErr = 'Không để trống email';
      return false;
    } else if (!emailRegex.test($scope.userInfo.email)) {
      $scope.emailErr = 'Email sai định dạng';
      return false;
    }
    $http.get(url_user + '?name=' + $scope.userInfo.name).then(res => {
      $scope.getUserSignin = res.data;
      if ($scope.getUserSignin && $scope.getUserSignin.length > 0 && $scope.getUserSignin[0].name) {
        alert('Tên đăng nhập đã tồn tại');
      } else {
        $scope.userUpdateData = {
          name: $scope.userInfo.name,
          email: $scope.userInfo.email,
        };
        $http.patch(url_user + '/' + userIdData.value, $scope.userUpdateData)
          .then(res => {
            alert('Cập Nhật Hồ Sơ Thành Công');
          });
      }
    });
  };
  $scope.updatePassword = function () {
    $scope.newpasswordErr = '';
    $scope.cNewPasswordErr = '';
    if (!$scope.newPassword) {
      $scope.newpasswordErr = 'Vui lòng nhập mật khẩu mới';
      return false;
    } else if (!$scope.cNewPassword) {
      $scope.cNewPasswordErr = 'Vui lòng nhập lại mật khẩu mới';
      return false;
    } else if ($scope.newPassword !== $scope.cNewPassword) {
      $scope.cNewPasswordErr = 'Mật khẩu nhập lại chưa khớp';
      return false;
    }
    $scope.newPasswordData = {
      password: $scope.newPassword,
    };
    $http.patch(url_user + '/' + userIdData.value, $scope.newPasswordData)
      .then(res => {
        alert('Cập Nhật Mật Khẩu Mới Thành Công');
      });
  }
}).controller('SigninController', function ($scope, $rootScope, $http) {
  $rootScope.title = 'Đăng Nhập';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  if (getUserId) {
    window.location.href = "#!home";
  } else {
    $scope.signin = function () {
      $scope.usernameErr = '';
      $scope.productNameErr = '';
      if (!$scope.username) {
        $scope.usernameErr = 'Vui lòng không để trống tên đăng nhập';
        return false;
      } else if (!$scope.password) {
        $scope.passwordErr = 'Vui lòng không để trống mật khẩu';
        return false;
      }
      $http.get(url_user + '?name=' + $scope.username + '&password=' + $scope.password).then(res => {
        $scope.getUserSignin = res.data;
        if ($scope.getUserSignin && $scope.getUserSignin.length > 0 && $scope.getUserSignin[0].name && $scope.getUserSignin[0].password) {
          // Set thời gian tồn tại của localStorage userId
          setWithExpiry("userId", $scope.getUserSignin[0].id, 3600 * 1000);
          window.location.href = "index.html";
        } else {
          alert('Tài khoản không tồn tại');
        }
      });
    }
  }
}).controller('SignupController', function ($scope, $rootScope, $http) {
  $rootScope.title = 'Đăng Ký';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  if (getUserId) {
    window.location.href = "#!home";
  } else {
    $scope.signup = function () {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      $scope.usernameErr = '';
      $scope.productNameErr = '';
      $scope.emailErr = '';
      $scope.passwordErr = '';
      $scope.cpasswordErr = '';
      if (!$scope.username) {
        $scope.usernameErr = 'Vui lòng không để trống tên đăng nhập';
        return false;
      } else if (!$scope.email) {
        $scope.emailErr = 'Vui lòng không để trống email';
        return false;
      } else if (!emailRegex.test($scope.email)) {
        $scope.emailErr = 'Email sai định dạng';
        return false;
      } else if (!$scope.password) {
        $scope.passwordErr = 'Vui lòng không để trống mật khẩu';
        return false;
      } else if (!$scope.cpassword) {
        $scope.cpasswordErr = 'Vui lòng nhập lại mật khẩu';
        return false;
      } else if ($scope.password !== $scope.cpassword) {
        $scope.cpasswordErr = 'Mật khẩu chưa khớp';
        return false;
      }
      // Thực hiện chức năng đăng ký tài khoản
      $http.get(url_user + '?name=' + $scope.username).then(res => {
        if (res.data && res.data.length > 0 && res.data[0].name) {
          alert('Tên đăng nhập đã tồn tại');
        } else {
          $scope.dataUser = {
            name: $scope.username,
            email: $scope.email,
            password: $scope.password,
          };
          $http.post(url_user, $scope.dataUser).then(res => {
            alert('Đăng ký thành công');
            window.location.href = "#!signin";
          });
        }
      });
    };
  };
}).controller('AddProductController', function ($scope, $http, $rootScope) {
  $rootScope.title = 'Thêm Sản Phẩm';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  // Lấy tất cả sản phẩm show ra table
  $http.get(url_product)
    .then(function (res) {
      $scope.getAllProduct = res.data;
      $scope.productCategories = {};
      $scope.getAllProduct.forEach(function (product) {
        $http.get(url_category + '?id=' + product.category)
          .then(function (res) {
            $scope.productCategories[product.category] = res.data[0].name;
          });
      });
    });
  // Thêm sản phẩm
  $scope.addProduct = function () {
    var productImage = $('#imageShow').getAttribute('src');
    $scope.productImageErr = '';
    $scope.productNameErr = '';
    $scope.productPriceErr = '';
    $scope.productCategoryErr = '';
    $scope.productTopErr = '';
    $scope.productNewErr = '';
    $scope.productDescribeErr = '';
    if (!productImage) {
      $scope.productImageErr = 'Vui lòng thêm ảnh sản phẩm';
      return false;
    } else if (!$scope.productName) {
      $scope.productNameErr = 'Vui lòng nhập tên sản phẩm';
      return false;
    } else if (!$scope.productPrice) {
      $scope.productPriceErr = 'Vui lòng thêm giá sản phẩm';
      return false;
    } else if ($scope.productPrice <= 0) {
      $scope.productPriceErr = 'Giá tiền phải lớn hơn 0';
      return false;
    } else if (!$scope.productCategory) {
      $scope.productCategoryErr = 'Vui lòng chọn loại sản phẩm';
      return false;
    } else if (!$scope.productTop) {
      $scope.productTopErr = 'Vui lòng chọn có hoặc không';
      return false;
    } else if (!$scope.productNew) {
      $scope.productNewErr = 'Vui lòng chọn có hoặc không';
      return false;
    } else if (!$scope.productDescribe) {
      $scope.productDescribeErr = 'Vui lòng thêm mô tả sản phẩm';
      return false;
    }
    $scope.productData = {
      name: $scope.productName,
      image: productImage,
      price: $scope.productPrice,
      category: $scope.productCategory,
      top: $scope.productTop,
      new: $scope.productNew,
      describe: $scope.productDescribe
    };
    $http.post(url_product, $scope.productData)
      .then(res => {
        alert('Thêm Sản Phẩm Thành Công');
      })
  };
  // Xóa dữ liệu trong form
  $scope.resetForm = function () {
    $('#imageShow').src = '';
    $('#imageProduct').value = '';
    $scope.productName = '';
    $scope.productPrice = '';
    $scope.productCategory = '';
    $scope.productTop = '';
    $scope.productNew = '';
    $scope.productDescribe = '';
  }
  // Xóa sản phẩm
  $scope.deleteProduct = function (productId) {
    var confirmDelete = confirm('Bạn Có Chắc Chắn Muốn Xóa Sản Phẩm Này?');
    if (confirmDelete) {
      $http.delete(url_product + '/' + productId)
        .then(res => {
          alert('Xóa sản phẩm thành công');
        });
    }
  };
}).controller('UpdateProductController', function ($scope, $rootScope, $routeParams, $http) {
  $rootScope.title = 'Cập Nhật Sản Phẩm';
  $rootScope.homeActive = null;
  $rootScope.shopActive = null;
  $rootScope.aboutActive = null;
  $rootScope.contactActive = null;
  $rootScope.surveyActive = null;
  $rootScope.authActive = null;
  $http.get(url_category)
    .then(function (res) {
      $scope.categories = res.data;
    });
  // Lấy tất cả sản phẩm show ra table
  $http.get(url_product + '/' + $routeParams.id)
    .then(function (res) {
      $scope.getProductUpdate = res.data;
      $scope.productNameUpdate = res.data.name;
      $scope.productPriceUpdate = res.data.price;
      $scope.productCategoryUpdate = res.data.category;
      $scope.productTopUpdate = res.data.top;
      $scope.productNewUpdate = res.data.new;
      $scope.productDescribeUpdate = res.data.describe;
    });
  // Sửa sản phẩm
  $scope.updateProduct = function () {
    var productImageUpdate = $('#imageShowUpdate').getAttribute('src');
    $scope.productNameUpdateErr = '';
    $scope.productPriceUpdateErr = '';
    $scope.productDescribeUpdateErr = '';
    if (!$scope.productNameUpdate) {
      $scope.productNameUpdateErr = 'Vui lòng nhập tên sản phẩm';
      return false;
    } else if (!$scope.productPriceUpdate) {
      $scope.productPriceUpdateErr = 'Vui lòng thêm giá sản phẩm';
      return false;
    } else if ($scope.productPriceUpdate <= 0) {
      $scope.productPriceUpdateErr = 'Giá tiền phải lớn hơn 0';
      return false;
    } else if (!$scope.productDescribeUpdate) {
      $scope.productDescribeUpdateErr = 'Vui lòng thêm mô tả sản phẩm';
      return false;
    }
    $scope.productDataUpdate = {
      name: $scope.productNameUpdate,
      image: productImageUpdate,
      price: $scope.productPriceUpdate,
      category: $scope.productCategoryUpdate,
      top: $scope.productTopUpdate,
      new: $scope.productNewUpdate,
      describe: $scope.productDescribeUpdate
    };
    $http.put(url_product + '/' + $routeParams.id, $scope.productDataUpdate)
      .then(res => {
        alert('Cập Nhật Sản Phẩm Thành Công');
        window.location.href = '#!admin';
      });
  };
}).config(function ($routeProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: './views/home/home.html',
      controller: 'HomeController'
    })
    .when('/shop', {
      templateUrl: './views/shop/shop.html',
      controller: 'ShopController'
    })
    .when('/detail/:id', {
      templateUrl: './views/shop/detail.html',
      controller: 'DetailController'
    })
    .when('/about', {
      templateUrl: './views/about/about.html',
      controller: 'AboutController'
    })
    .when('/contact', {
      templateUrl: './views/contact/contact.html',
      controller: 'ContactController'
    })
    .when('/profile', {
      templateUrl: './views/profile/profile.html',
      controller: 'ProfileController'
    })
    .when('/survey', {
      templateUrl: './views/survey/survey.html',
      controller: 'SurveyController'
    })
    .when('/signin', {
      templateUrl: './views/auth/signin.html',
      controller: 'SigninController'
    })
    .when('/signup', {
      templateUrl: './views/auth/signup.html',
      controller: 'SignupController'
    })
    .when('/admin', {
      templateUrl: './views/admin/addProduct.html',
      controller: 'AddProductController'
    })
    .when('/update/:id', {
      templateUrl: './views/admin/updateProduct.html',
      controller: 'UpdateProductController'
    })
    .otherwise({
      redirectTo: '/home'
    });
});