const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const EventModel = require("./models/Event");
const router = express.Router();
const socketIo = require('socket.io');

const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/yazlab")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

  app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    EmployeeModel.findOne({ email: email })
      .then(user => {
        if (user) {
          if (user.password === password) {
            // Giriş başarılı, aktiflik durumunu güncelle
            user.isActive = true;
            user.save()
              .then(() => {
                res.status(200).json("Success");
              })
              .catch(err => res.status(500).json("Error updating active status"));
          } else {
            res.status(400).json("Incorrect password");
          }
        } else {
          res.status(404).json("No user found");
        }
      })
      .catch(err => res.status(500).json(err));
  });
  

  app.post("/signup", (req, res) => {
    const { body } = req;
  
    EmployeeModel.create(body)
      .then(employee => res.status(201).json(employee))
      .catch(err => {
        console.error(err);
        res.status(500).json(err);
      });
  });
  

  app.put('/user/update', (req, res) => {
    const { email } = req.body; // E-posta, kullanıcının bilgilerini bulmak için
    const updateData = req.body; // Güncellenen veriler
  
    EmployeeModel.findOneAndUpdate({ email: email }, updateData, { new: true })
      .then(updatedUser => {
        if (updatedUser) {
          res.status(200).json(updatedUser);
        } else {
          res.status(404).json("Kullanıcı bulunamadı");
        }
      })
      .catch(err => {
        console.error("Hata:", err);
        res.status(500).json("Veritabanı hatası");
      });
  });
  


// Kullanıcıyı ve email bilgisini almak için bir endpoint
app.get("/user", (req, res) => {
  const { email } = req.query;
  EmployeeModel.findOne({ email: email })
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json("User not found");
      }
    })
    .catch(err => res.status(500).json(err));
});

// Çıkış işlemi
app.post("/logout", (req, res) => {
  const { email } = req.body;

  EmployeeModel.findOne({ email: email })
    .then(user => {
      if (user) {
        // Kullanıcıyı aktif olmama durumuna getirebilirsiniz
        user.isActive = false;
        user.save()
          .then(() => {
            res.status(200).json("Successfully logged out");
          })
          .catch(err => res.status(500).json("Error updating user status"));
      } else {
        res.status(404).json("No user found");
      }
    })
    .catch(err => res.status(500).json("Error fetching user data"));
});



app.post("/create-event", async (req, res) => {
  const { name, date, location, type, createdBy } = req.body;

  // Gerekli alanları kontrol et
  if (!name || !date || !location || !type || !createdBy) {
    return res.status(400).json({ error: "Tüm alanlar gereklidir" });
  }

  try {
    // Kullanıcıyı buluyoruz
    const user = await EmployeeModel.findOne({ email: createdBy });
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Etkinlik oluşturulmadan önce kullanıcıya 15 puan ekliyoruz
    user.points += 15;
    await user.save();  // Kullanıcının puanını kaydediyoruz

    // Yeni etkinlik oluştur
    const newEvent = new EventModel({
      name,
      date,
      location,
      type,
      createdBy,  // Etkinliği oluşturan kişinin emaili
    });

    await newEvent.save();
    res.status(201).json(newEvent); // Yeni etkinlik oluşturulmuş olarak döndürülüyor
  } catch (err) {
    console.error("Etkinlik oluşturulurken hata oluştu:", err);
    res.status(500).json({ error: "Etkinlik oluşturulurken bir hata oluştu", details: err.message });
  }
});



// Kullanıcıları almak için API
app.get('/users', async (req, res) => {
  try {
    const users = await EmployeeModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Kullanıcılar alınırken bir hata oluştu.' });
  }
});


// Kullanıcı Düzenleme (PUT) - name'e göre düzenleme
app.put('/users/:name', async (req, res) => {
  const { name } = req.params;  // Kullanıcı adı (name)
  const { email, isActive } = req.body;  // Güncellenmesi gereken bilgiler

  try {
    // Kullanıcıyı name'e göre bulup güncelleme
    const user = await EmployeeModel.findOneAndUpdate(
      { name },  // name'e göre arama
      { email, isActive },  // güncellenmesi gereken alanlar
      { new: true }  // Yeni veriyi döndürmek için
    );

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.status(200).json({ message: "Kullanıcı başarıyla güncellendi.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Kullanıcı Silme (DELETE) - name'e göre silme
app.delete('/users/:name', async (req, res) => {
  const { name } = req.params;

  try {
    // Kullanıcıyı name'e göre silme
    const user = await EmployeeModel.findOneAndDelete({ name });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.status(200).json({ message: "Kullanıcı başarıyla silindi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// 1. Tüm etkinlikleri getir
app.get("/events", async (req, res) => {
  try {
    const events = await EventModel.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Etkinlikler alınamadı" });
  }
});

app.get("/createdevent", (req, res) => {
  const { email } = req.query;  // Kullanıcı email'i parametre olarak alalım

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  // Yalnızca kurucusu belirtilen etkinlikleri getirelim
  EventModel.find({ createdBy: email })
    .then(events => res.json(events))
    .catch(err => {
      console.error("Error fetching events", err);
      res.status(500).json({ error: "Failed to fetch events", details: err.message });
    });
});



// Etkinlik ismine göre detaylı bilgileri almak için endpoint
app.get("/events/:name", (req, res) => {
  const { name } = req.params; // URL parametresinden etkinlik ismini alıyoruz

  EventModel.findOne({ name })  // Etkinlik ismine göre sorgulama yapıyoruz
    .then(event => {
      if (!event) {
        return res.status(404).json({ error: "Etkinlik bulunamadı" });
      }
      res.json(event);  // Etkinlik bilgilerini döndürüyoruz
    })
    .catch(err => {
      console.error("Etkinlik bilgileri alınırken hata oluştu:", err);
      res.status(500).json({ error: "Etkinlik bilgileri alınırken bir hata oluştu", details: err.message });
    });
});



// 3. Etkinliğe katılım
app.put("/events/join/:name", async (req, res) => {
  const { name } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Kullanıcı ID gerekli" });
  }

  try {
    const event = await EventModel.findOne({ name });
    if (!event) {
      return res.status(404).json({ error: "Etkinlik bulunamadı" });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ error: "Kullanıcı zaten etkinliğe katılmış" });
    }

    event.participants.push(userId);
    await event.save();

    res.status(200).json({ message: "Etkinliğe başarıyla katıldınız", event });
  } catch (error) {
    res.status(500).json({ error: "Etkinliğe katılırken hata oluştu" });
  }
});

// 4. Yeni etkinlik ekle (isteğe bağlı)
app.post("/events", async (req, res) => {
  const { name, date, location, type } = req.body;

  try {
    const newEvent = new EventModel({ name, date, location, type });
    await newEvent.save();
    res.status(201).json({ message: "Yeni etkinlik oluşturuldu", event: newEvent });
  } catch (error) {
    res.status(500).json({ error: "Etkinlik oluşturulamadı" });
  }
});





//silme
app.delete("/events/:name", (req, res) => {
  const { name } = req.params;

  EventModel.findOneAndDelete({ name })
    .then(deletedEvent => {
      if (!deletedEvent) {
        return res.status(404).json({ error: "Etkinlik bulunamadı" });
      }
      res.json({ message: "Etkinlik başarıyla silindi", event: deletedEvent });
    })
    .catch(err => {
      console.error("Error deleting event:", err);
      res.status(500).json({ error: "Failed to delete event", details: err.message });
    });
});




//güncelleme
app.put("/editevents/:name", (req, res) => {
  const { name } = req.params; // URL parametresinden etkinlik ismini alıyoruz
  const { newName, date, location, type, createdBy } = req.body; // Yeni verileri request'ten alıyoruz

  console.log("Güncellenen Veri:", { newName, date, location, type, createdBy }); // Log ekleyin

  // Etkinliği bulup güncelleme işlemi
  EventModel.findOneAndUpdate(
    { name }, 
    {
      name: newName || name,
      date,
      location,
      type,
      createdBy
    },
    { new: true } // Yeni haliyle döndürsün
  )
  .then(event => {
    console.log("Güncellenmiş Etkinlik:", event); // Backend logları
    if (!event) {
      return res.status(404).json({ error: "Etkinlik bulunamadı" });
    }
    res.json(event);
  })
  .catch(err => {
    console.error("Etkinlik güncellenirken hata oluştu:", err);
    res.status(500).json({ error: "Etkinlik güncellenirken bir hata oluştu", details: err.message });
  });
  
});




// Katılma işlemi
app.put("/events/join/:name", (req, res) => {
  const { name } = req.params;  // Etkinlik adı
  const { userId } = req.body;  // Katılacak kullanıcı ID'si

  EventModel.findOne({ name: name })  // Etkinlik adıyla arama yapıyoruz
    .then(event => {
      if (!event) {
        return res.status(404).json({ error: "Etkinlik bulunamadı" });
      }
      // Katılımcıyı etkinliğe ekle
      event.participants.push(userId);
      event.save()
        .then(updatedEvent => res.json(updatedEvent))
        .catch(err => res.status(500).json({ error: "Katılma işlemi sırasında hata oluştu", details: err.message }));
    })
    .catch(err => res.status(500).json({ error: "Hata oluştu", details: err.message }));
});



// Kullanıcının katıldığı etkinlikleri al
app.get("/user-events/:userId", (req, res) => {
  const { userId } = req.params;

  // Katıldığı etkinlikleri buluyoruz
  EventModel.find({ participants: userId })
    .then(events => {
      if (!events || events.length === 0) {
        return res.status(404).json({ error: "Katıldığınız etkinlik bulunamadı" });
      }
      res.json(events);  // Kullanıcının katıldığı etkinlikleri döndürüyoruz
    })
    .catch(err => {
      console.error("Hata oluştu:", err);
      res.status(500).json({ error: "Sunucu hatası", details: err.message });
    });
});

app.get('/events/joined/:userId', (req, res) => {
  const userId = req.params.userId;
  // Veritabanından etkinlikleri kullanıcı ID'sine göre sorgulayın
  Event.find({ participants: userId })
    .then(events => res.json(events))
    .catch(error => res.status(500).json({ error: 'Veri alınırken bir hata oluştu.' }));
});



app.put("/eventinformation/join/", async (req, res) => {
  const { email, eventName } = req.body;  // Frontend'den gelen email ve eventName bilgisi

  console.log("Backend'e Gelen Email:", email);
  console.log("Etkinlik İsmi:", eventName);

  try {
    // Etkinliği email ve eventName ile buluyoruz
    const event = await EventModel.findOne({ name: eventName });
    if (!event) {
      return res.status(404).json({ error: "Etkinlik bulunamadı" });
    }

    // Kullanıcıyı buluyoruz
    const user = await EmployeeModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Kullanıcı zaten katılmış mı diye kontrol ediyoruz
    if (event.participants.includes(email)) {
      return res.status(400).json({ message: "Bu etkinlikte zaten katıldınız" });
    }

    // Kullanıcının katıldığı etkinlikleri kontrol ediyoruz
    const conflictingEvent = await EventModel.find({
      participants: email,
      date: { $eq: event.date }  // Aynı tarihte katıldığı etkinlikleri arıyoruz
    });

    if (conflictingEvent.length > 0) {
      return res.status(400).json({ message: "Bu tarihte başka bir etkinliğe katıldınız" });
    }

    // Katılım sağlıyoruz
    event.participants.push(email);
    await event.save();  // Etkinlikteki değişiklikleri kaydediyoruz

    // Kullanıcının puanını kontrol ediyoruz ve uygun şekilde artırıyoruz
    if (user.points === 0 || user.points === 15) {
      user.points += 20;  // Eğer puan 0 veya 15 ise 20 puan ekliyoruz
    } else {
      user.points += 10;  // Diğer durumlarda 10 puan ekliyoruz
    }

    await user.save();  // Değişiklikleri kaydediyoruz

    res.status(200).json({ message: "Başarıyla etkinliğe katıldınız ve puanınız artırıldı!" });
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});




app.get('/suggested-events', async (req, res) => {
  try {
    const { email } = req.query;  // Email parametresini alıyoruz
    
    // Kullanıcıyı email'e göre buluyoruz
    const employee = await EmployeeModel.findOne({ email });

    if (!employee) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının "interests" alanını alıp, boşlukla ayırıyoruz
    const interestsArray = employee.interests.split(' ');

    // Tüm etkinlikleri alıyoruz, ve her etkinliği filtreliyoruz
    const suggestedEvents = [];
    for (let interest of interestsArray) {
      // İlgi alanına uygun etkinlikleri buluyoruz
      const matchingEvents = await EventModel.find({ type: { $regex: new RegExp(interest, 'i') } });

      // Eşleşen etkinlikleri önerilen etkinlikler listesine ekliyoruz
      suggestedEvents.push(...matchingEvents);
    }

    // Tekrarlanan etkinliklerin önüne geçmek için benzersiz etkinlikleri alıyoruz
    const uniqueSuggestedEvents = [];
    const seenEventIds = new Set();

    for (const event of suggestedEvents) {
      if (!seenEventIds.has(event._id.toString())) {
        seenEventIds.add(event._id.toString());
        uniqueSuggestedEvents.push(event);
      }
    }

    res.json(uniqueSuggestedEvents);  // Önerilen etkinlikleri gönderiyoruz
  } catch (error) {
    console.error("Önerilen etkinlikler alınırken bir hata oluştu:", error);
    res.status(500).json({ message: "İç server hatası!" });
  }
});




app.put('/adminevents/:name', (req, res) => {
  const eventName = req.params.name; // URL'den etkinlik adı alınır
  const updatedData = req.body; // Gönderilen güncellenmiş veriler

  // Etkinliği güncelleme işlemi
  EventModel.updateOne({ name: eventName }, updatedData)
    .then((result) => {
      if (result.nModified > 0) {
        // Etkinlik başarıyla güncellendi
        res.status(200).json({ message: "Etkinlik başarıyla güncellendi" });
      } else {
        // Hiçbir veri güncellenmedi
        res.status(400).json({ error: "Etkinlik bulunamadı veya değişiklik yapılmadı" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Güncelleme sırasında hata oluştu", details: error.message });
    });
});



app.get('/users/:userName', async (req, res) => {

  const { userName } = req.params;
  try {
    const user = await EmployeeModel.findOne({ 
      $or: [{ email: userName }, { firstName: userName }] 
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (err) {
    console.error('Hata oluştu:', err);
    res.status(500).json({ error: 'Kullanıcı bilgileri alınırken bir hata oluştu.' });
  }
});


app.post("/reset-password", (req, res) => {
  console.log("Gelen istek:", req.body); // Gelen veriyi logla

  const { email, newPassword } = req.body;

  EmployeeModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        user.password = newPassword;
        user.save()
          .then(() => res.status(200).json("Şifre başarıyla güncellendi."))
          .catch((err) => {
            console.error("Şifre güncellenirken hata:", err);
            res.status(500).json("Şifre güncellenirken hata oluştu.");
          });
      } else {
        res.status(404).json("Kullanıcı bulunamadı.");
      }
    })
    .catch((err) => {
      console.error("Veritabanı hatası:", err);
      res.status(500).json("Veritabanı hatası.");
    });
});







app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
