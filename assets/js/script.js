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