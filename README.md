# Proyek Klasifikasi Gambar: Penyakit Tanaman Kentang

## Deskripsi Proyek
Proyek ini merupakan model *Machine Learning* berbasis *Convolutional Neural Network* (CNN) yang dibangun untuk mengklasifikasikan kondisi daun tanaman kentang. Model ini dilatih untuk mengenali tiga kondisi berbeda pada daun kentang berdasarkan citra visual, sehingga dapat membantu dalam deteksi dini penyakit tanaman.

## Dataset
Dataset yang digunakan diambil dari [New Plant Diseases Dataset](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset) di Kaggle. Dari dataset asli yang sangat besar, proyek ini memfilter dan hanya menggunakan bagian tanaman kentang (*Potato*), yang terdiri dari lebih dari 7.000 gambar yang terbagi secara seimbang ke dalam 3 kelas:
1. `Potato___Early_blight` (Bercak daun awal)
2. `Potato___Late_blight` (Hawar daun lanjut)
3. `Potato___healthy` (Daun sehat)

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
Model berhasil melampaui batas minimum akurasi 85% dengan hasil evaluasi pada *Test Set* sebagai berikut:
* **Training Accuracy:** ~97%
* **Validation Accuracy:** ~91%
* **Testing Accuracy:** ~90.20%

## Struktur Direktori Submission
Model yang telah dilatih diekspor ke dalam tiga format berbeda (SavedModel, TF-Lite, dan TFJS) agar siap di-*deploy* ke berbagai *platform*. Berikut adalah struktur folder proyek ini:

```text
submission/
├───tfjs_model/                 # Model dalam format TensorFlow.js untuk web
│   ├───group1-shard1of6.bin
│   ├───group1-shard2of6.bin
│   ├───group1-shard3of6.bin
│   ├───group1-shard4of6.bin
│   ├───group1-shard5of6.bin
│   ├───group1-shard6of6.bin
│   └───model.json
├───tflite/                     # Model dalam format TensorFlow Lite untuk mobile
│   ├───model.tflite
│   └───label.txt
├───saved_model/                # Model standar format Keras/TensorFlow
│   ├───fingerprint.pb
│   ├───saved_model.pb
│   ├───assets
│   └───variables/
├───Template_Submission_Akhir.ipynb              # File utama Jupyter Notebook yang berisi kode lengkap
├───README.md                   # Dokumentasi proyek
└───requirements.txt            # Daftar library Python yang digunakan