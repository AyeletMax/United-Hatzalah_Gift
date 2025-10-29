// בדיקת חיבור בין לקוח לשרת
async function testConnection() {
    const API_URL = 'http://localhost:3000';
    
    console.log('בודק חיבור לשרת...');
    
    try {
        // בדיקת חיבור בסיסי
        const testResponse = await fetch(`${API_URL}/api/test`);
        console.log('תגובת בדיקה:', await testResponse.json());
        
        // בדיקת קטגוריות
        const categoriesResponse = await fetch(`${API_URL}/api/categories`);
        const categories = await categoriesResponse.json();
        console.log('קטגוריות:', categories);
        
        // בדיקת מוצרים
        const productsResponse = await fetch(`${API_URL}/api/products`);
        const products = await productsResponse.json();
        console.log(`נמצאו ${products.length} מוצרים`);
        
        // בדיקת הוספת מוצר
        const newProduct = {
            name: 'מוצר בדיקה JS',
            description: 'תיאור בדיקה',
            category_id: 1,
            unit_price_incl_vat: 123.45,
            delivery_time_days: 7,
            brand: 'מותג בדיקה',
            last_buyer: 'בדיקה JS',
            last_ordered_by_name: 'בדיקה JS',
            displayed_by: 'מנהל בדיקה',
            popularity_score: 0
        };
        
        console.log('מנסה להוסיף מוצר:', newProduct);
        
        const addResponse = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });
        
        if (addResponse.ok) {
            const result = await addResponse.json();
            console.log('מוצר נוסף בהצלחה:', result);
            
            // מחיקת המוצר
            const deleteResponse = await fetch(`${API_URL}/api/products/${result.id}`, {
                method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
                console.log('מוצר נמחק בהצלחה');
            }
        } else {
            const errorText = await addResponse.text();
            console.error('שגיאה בהוספת מוצר:', addResponse.status, errorText);
        }
        
    } catch (error) {
        console.error('שגיאת חיבור:', error);
    }
}

// הרצת הבדיקה
testConnection();