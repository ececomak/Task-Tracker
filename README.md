# Mini Task Tracker POC

Bu proje, 3 günlük araştırma ve POC çalışması kapsamında hazırlanmış uçtan uca küçük bir full stack örnektir.

Projede React, TypeScript ve Tailwind CSS ile basit bir frontend arayüzü; .NET Web API ile CRUD işlemleri yapan bir backend servisi; PostgreSQL ile veritabanı katmanı hazırlanmıştır. Tüm servisler Docker Compose ile birlikte çalışacak şekilde yapılandırılmıştır.

## Kullanılan Teknolojiler

- React
- TypeScript
- Tailwind CSS
- .NET 8 Web API
- Entity Framework Core
- PostgreSQL
- Docker
- Docker Compose
- Git / GitHub

## Proje Özeti

Mini Task Tracker uygulaması üzerinden görev kayıtları oluşturulabilir, listelenebilir, tamamlandı olarak işaretlenebilir ve silinebilir.

Bu örnek ile frontend, backend ve veritabanı katmanlarının birlikte çalışması amaçlanmıştır.

## Özellikler

- Görev ekleme
- Görevleri listeleme
- Görev durumunu güncelleme
- Görev silme
- PostgreSQL üzerinde veri saklama
- Docker Compose ile tek komutla çalıştırma

## Proje Yapısı

```text
mini-task-tracker-poc
├── backend
│   ├── Controllers
│   ├── Data
│   ├── Models
│   ├── Migrations
│   ├── Dockerfile
│   └── Program.cs
├── frontend
│   ├── src
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md# Mini Task Tracker POC
