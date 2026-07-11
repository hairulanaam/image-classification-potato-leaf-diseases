# Proyek Klasifikasi Gambar: Tanaman Kentang Penyakit (Early/Late Blight) dan Sehat

## Deskripsi Proyek
Proyek ini merupakan model *Machine Learning* berbasis *Convolutional Neural Network* (CNN) yang dibangun untuk mengklasifikasikan kondisi daun tanaman kentang. Model ini dilatih untuk mengenali tiga kondisi berbeda pada daun kentang berdasarkan citra visual, sehingga dapat membantu dalam deteksi dini kondisi tanaman kentang.

## Dataset
Dataset yang digunakan diambil dari [New Plant Diseases Dataset](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset) di Kaggle. Dari dataset asli yang sangat besar, proyek ini memfilter dan hanya menggunakan bagian tanaman kentang (*Potato*), yang terdiri dari lebih dari 7.000 gambar yang terbagi secara seimbang ke dalam 3 kelas:
1. Early Blight
2. Late Blight
3. Healthy

Dataset dibagi menjadi tiga bagian menggunakan rasio: **80% Data Latih (Train)**, **10% Data Validasi (Validation)**, dan **10% Data Uji (Test)**. 

## Pra-pemrosesan Data
* **Ukuran Gambar:** Seluruh gambar diubah ukurannya (*resize*) menjadi 150x150 piksel dengan format RGB (3 *channel*).
* **Normalisasi:** Piksel di-*rescale* menggunakan nilai `1./255`.
* **Augmentasi Data:** Diterapkan secara khusus pada *Training Set* untuk mencegah *overfitting*, meliputi: rotasi, *width/height shift*, *zoom*, dan *horizontal flip*.

## Arsitektur Model
Model dibangun secara runtun menggunakan Keras `Sequential` API dengan detail lapisan sebagai berikut:
* **Input Layer & Konvolusi:** 3 blok layer `Conv2D` (dengan *filter* 32, 64, dan 128) dipasangkan dengan `BatchNormalization` dan `MaxPooling2D`.
* **Flatten Layer:** Meratakan matriks fitur multidimensi menjadi *array* 1D.
* **Fully Connected Layer (Hidden Layer):** `Dense` layer dengan 128 dan 64 neuron (aktivasi ReLU), dilengkapi dengan `Dropout` (0.5 dan 0.3) untuk regulerisasi.
* **Output Layer:** `Dense` layer dengan 3 neuron menggunakan aktivasi `softmax` untuk menghasilkan probabilitas klasifikasi multikelas.

## Hasil Evaluasi (Performa Model)
Model berhasil mendapatkan tingkat akurasi sebesar 90% menggunakan data uji (test)
