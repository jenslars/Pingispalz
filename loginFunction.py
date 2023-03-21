import psycopg2

def main():
    '''
    Huvudfunktionen i programmet som hantera välkomnande av användaren,
    '''
    # 1. Skriver ut en välkomstfras

    # 2. Funktionen för menyn
    menu_choice = False
    while menu_choice != "0":
        welcome_menu()
        user_choice = input("Submit choice: ")
        if user_choice == "1":
            user_login()
        elif user_choice == "2":
            admin_login()
        elif user_choice == "3":
            new_customer()
        elif user_choice == "4":
            print("Thank you for visiting our shop!")
            break
        else:
            print("You did not submit a viable choice, please try again.")

def admin_login():
    '''' Här loggar admin-användaren in, när den gjort det presenteras den med en meny'''
    admin_username = input('Username:')
    admin_password = input('Password:')
    
    if admin_validate_login(admin_username, admin_password):
        print('great success!')       
    else:
        print("Felaktigt inlogg")

def admin_validate_login(admin_username, admin_password):
    '''' Här loggar admin-användaren in, när den gjort det presenteras den med en meny'''
    try: 
        connection = psycopg2.connect(database="tjh_projekt",
                                      user="an7066",
                                      password="csodbjar",
                                      host='pgserver.mau.se',
                                      port="5432")

        cursor = connection.cursor()
        cursor.execute('SELECT * FROM admins WHERE admin_username = %s AND admin_password = %s', (admin_username, admin_password))
        validation = cursor.fetchone()
        cursor.close()
        connection.close()
        return validation is not None
        
    except (Exception) as error:
        print("Error while connecting to PostgreSQL", error)

def user_login():
    '''' Här loggar kund-användaren in, när den gjort det presenteras den med en meny'''
    global username
    
    username = input('Username:')
    password = input('Password:')
    
    if validate_user_login(username, password):
        print('Great success!')       
    else:
        print("Felaktigt inlogg")


def validate_user_login(username, password):
    try: 
        connection = psycopg2.connect(database="tjh_projekt",
                                      user="an7066",
                                      password="csodbjar",
                                      host='pgserver.mau.se',
                                      port="5432")

        cursor = connection.cursor()
        cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))
        validation = cursor.fetchone()
        cursor.close()
        connection.close()
        return validation is not None
    except (Exception) as error:
            print("Error while connecting to PostgreSQL", error)

def new_customer():
    '''' Här registrerar kunden sig för databasen, kunden ska sedan logga in sig'''
    new_username = input('Choose a username: ')
    new_password = input('Choose a password: ')
    firstname = input('Your firstname: ')
    lastname = input('Your lastname: ')
    email = input('Your email: ')
    adress = input('Your adress: ')
    city = input('City of residence: ')
    country = input('Country of residence: ')
    phone_number = input('Phone number: ')
    try: 
        conn_str = "dbname=tjh_projekt user=an7066 password=csodbjar host=pgserver.mau.se port=5432"
        # Create a connection object
        conn = psycopg2.connect(conn_str)
        # Create a cursor object
        cursor = conn.cursor()
        # Call the stored procedure
        cursor.callproc('add_user',(new_username, new_password, firstname, lastname, email, adress, city, country, phone_number))
        conn.commit()
        cursor.close()
        conn.close()
        user_login()
    except:
        print("Error, try inserting valid inputs")

def welcome_menu():
    '''Welcome menu'''
    print("-"*30)
    print('Welcome!')
    print("-"*30)
    print('1. Log in as customer')
    print('2. Log in as admin')
    print('3. Register as new customer')
    print('4. Exit')


main()