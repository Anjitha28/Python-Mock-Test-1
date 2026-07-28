const mockTest1Data = [
    {
        "id": 1,
        "type": "DROPDOWN",
        "q": "You need to test whether an object is an instance of a specific class.<br>How should you set up the unit test?<br>Complete the code by selecting the correct option from each drop-down list.<br><span style='font-size: 12px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "[b1] unittest\nclass TestIsInstance([b2]):\n    def [b3]\n        [b4]\n\nif __name__ == '__main__':\n    unittest.main()",
        "options": [
            [
                "define",
                "import",
                "include",
                "using"
            ],
            [
                "unittest.TestCase",
                "test.TestCase",
                "TestCase.unittest",
                "TestCase.test"
            ],
            [
                "assert_isInstance(self):",
                "eval_isInstance(self):",
                "test_isInstance(self):",
                "try_isInstance(self):"
            ],
            [
                "self.assertIsInstance(obj, cls, msg=None)",
                "test.assertIsInstance(obj, cls, msg=None)",
                "this.assertIsInstance(obj, cls, msg=None)"
            ]
        ],
        "a": [
            "import",
            "unittest.TestCase",
            "test_isInstance(self):",
            "self.assertIsInstance(obj, cls, msg=None)"
        ]
    },
    {
        "id": 2,
        "type": "MCQ",
        "q": "You develop a Python application for your company.<br><br>You want to add notes to your code so other team members will understand it.<br><br>What should you do?",
        "options": [
            "Place the notes within /* and */ in any code segment.",
            "Place the notes within <!-- and --> in any code segment.",
            "Place the notes after # on any line.",
            "Place the notes after // on any line."
        ],
        "a": 2
    },
    {
        "id": 3,
        "type": "DROPDOWN",
        "q": "You are writing a program to randomly assign rooms (room_number) and team-building groups (group) for a company retreat.<br><br>Complete the code by selecting the correct code segment from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "import random\nroomsAssigned=[1]\nroom_number=1\ngroupList=[\"Ropes\",\"Rafting\",\"Obstacle\",\"Wellness\"]\ncount=0\nprint(\"Welcome to CompanyPro's Team-Building Weekend!\")\nname=input(\"Please enter your name (q to quit)? \")\nwhile name.lower() != 'q' and count < 50:\n    while room_number in roomsAssigned:\n        [b1]\n    print(f\"{name}, your room number is {room_number}\")\n    roomsAssigned.append(room_number)\n    [b2]\n    print(f\"You are in the {group} group this afternoon.\")\n    name=input(\"Please enter your name (q to quit)? \")",
        "options": [
            [
                "room_number=random(1,50)",
                "room_number=random.randint(1,50)",
                "room_number=random.shuffle(1,50)",
                "room_number=random.random(1,50)"
            ],
            [
                "group = random.choice(groupList)",
                "group = random.randrange(groupList)",
                "group = random.shuffle(groupList)",
                "group = random.sample(groupList)"
            ]
        ],
        "a": [
            "room_number=random.randint(1,50)",
            "group = random.choice(groupList)"
        ]
    },
    {
        "id": 4,
        "type": "DROPDOWN",
        "q": "A company needs help updating their file system. You must create a simple file-manipulation program that performs the following actions:<br><br>• Creates a file using the specified name.<br>• Appends the phrase \"End of listing\" to the file.<br><br>You need to complete the code to meet the requirements.<br><br>Complete the code by selecting the correct code segment from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "import os\nfile = [b1]\n    [b2](\"End of listing\")\nfile.close()",
        "options": [
            [
                "open('myFile.txt', 'a')",
                "open('myFile.txt', 'r')",
                "open('myFile.txt', 'w')"
            ],
            [
                "append",
                "file.add",
                "file.write",
                "write"
            ]
        ],
        "a": [
            "open('myFile.txt', 'a')",
            "file.write"
        ]
    },
    {
        "id": 5,
        "type": "DROPDOWN",
        "q": "You are creating a program that accepts user input. The program must cast the input into an integer, and properly handle the error if it cannot do so.<br><br>Complete the code by selecting the correct code segment from each drop-down list.",
        "code": "while True:\n    [b1]\n        x = int(input(\"Please enter a number: \"))\n        break\n    [b2] ValueError:\n        print(\"Not a valid number. Try again...\")",
        "options": [
            [
                "try:",
                "else:",
                "except:",
                "raise:",
                "finally:"
            ],
            [
                "try",
                "else",
                "except",
                "raise",
                "finally"
            ]
        ],
        "a": [
            "try:",
            "except"
        ]
    },
    {
        "id": 6,
        "type": "DROPDOWN",
        "q": "A company needs help updating their file system. You must create a simple file-manipulation program that performs the following actions:<br><br>• Checks to see whether a file exists.<br>• If the file exists, displays its contents.<br><br>Complete the code by selecting the correct code segment from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "import os\nif [b1]\n    file = open('myFile.txt')\n    [b2]\n    file.close()",
        "options": [
            [
                "isfile('myFile.txt'):",
                "os.exist('myFile.txt'):",
                "os.find('myFile.txt'):",
                "os.path.isfile('myFile.txt'):"
            ],
            [
                "output('myFile.txt')",
                "print(file.get('myFile.txt'))",
                "print(file.read())",
                "print('myFile.txt')"
            ]
        ],
        "a": [
            "os.path.isfile('myFile.txt'):",
            "print(file.read())"
        ]
    },
    {
        "id": 7,
        "type": "DND",
        "q": "You are developing a program that prints all prime numbers between 2 and 100. The program must:\n• Loop through numbers from 2 to 100.\n• Determine whether each number is prime.\n• Stop checking a number once a divisor is found.\n\nComplete the code by dragging the correct code segments to the correct placement. <br><span style='font-size: 15px; font-style: italic;'>Note: Each code segment may be used once, more than once, or not at all. You will receive partial credit for each correct selection.</span>",
        "code": "[target1]\n    for i in range(2, p):\n        if p % i == 0:\n            is_prime = False\n            [target2]\n    if is_prime == True:\n        print(p)\n    [target3]",
        "options": [
            "break",
            "continue",
            "p = p + 1",
            "p = 2\nis_prime = True\nwhile p <= 100:",
            "p = 2\nwhile p <= 100:\n    is_prime = True"
        ],
        "a": [
            "p = 2\nwhile p <= 100:\n    is_prime = True",
            "break",
            "p = p + 1"
        ]
    },
    {
        "id": 8,
        "type": "DROPDOWN",
        "q": "You develop a Python application for your company.<br><br>You need to complete the code so that the print statements are accurate.<br><br>Complete the code by selecting the correct code segment from each drop-down list.",
        "code": "numList = [1, 2, 3, 4, 5]\nalphaList = [\"a\", \"b\", \"c\", \"d\", \"e\"]\n[b1]\n    print(\"The values in numList are equal to alphaList\")\n[b2]\n    print(\"The values in numList are not equal to alphaList\")",
        "options": [
            [
                "if numList = alphaList :",
                "if numList == alphaList :",
                "if numList += alphaList :"
            ],
            [
                "else :",
                "elif :",
                "elseif :"
            ]
        ],
        "a": [
            "if numList == alphaList :",
            "else :"
        ]
    },
    {
        "id": 9,
        "type": "MCQ",
        "q": "What does the following statement do?<br><br><code>data = input()</code>",
        "options": [
            "Creates an HTML input element",
            "Allows a user to enter text in the console",
            "Displays all input peripheral devices on the computer",
            "Displays a message box that allows user input"
        ],
        "a": 1
    },
    {
        "id": 10,
        "type": "TF",
        "q": "For each statement about the following function, select True or False.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "def grosspay(hours=40, rate=25, pieces=0, piecerate=0, salary=0):\n    overtime=0\n    if pieces > 0:\n        return pieces * piecerate\n    if salary > 0:\n        pass\n    if hours > 40:\n        overtime = (hours - 40) * (1.5 * rate)\n        return overtime + (40 * rate)\n    else:\n        return hours * rate",
        "options": [
            "A function call of grosspay() will create a syntax error.",
            "A function call of grosspay(salary=50000) will return nothing.",
            "A function call of grosspay(pieces=500, piecerate=4) will return a result of 2000."
        ],
        "a": [
            "FALSE",
            "FALSE",
            "TRUE"
        ]
    },
    {
        "id": 11,
        "type": "DROPDOWN",
        "q": "You are writing code to meet the following requirements:<br><br>• Allow users to repeatedly enter words.<br>• Output the number of characters in each word.<br><br>Complete the code by selecting the correct option from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "x = \"Hello\"\n[b1] x != \"QUIT\":\n    num = 0\n    [b2] char [b3] x:\n        num += 1\n    print(num)\n    x = input(\"Enter a new word or QUIT to exit: \")",
        "options": [
            [
                "for",
                "if",
                "while"
            ],
            [
                "for",
                "if",
                "while"
            ],
            [
                "and",
                "or",
                "in",
                "not"
            ]
        ],
        "a": [
            "while",
            "for",
            "in"
        ]
    },
    {
        "id": 12,
        "type": "TF",
        "q": "You are creating a Python program that compares numbers. You need to ensure that the comparisons are accurate.<br><br>For each statement, select True or False.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "01 num1 = eval(input(\"Please enter the first number: \"))\n02 num2 = eval(input(\"Please enter the second number: \"))\n03 if num1 == num2:\n04     print(\"The two numbers are equal.\")\n05 if num1 <= num2:\n06     print(\"Number 1 is less than number 2.\")\n07 if num1 > num2:\n08     print(\"Number 1 is greater than number 2.\")\n09 if num2 = num1:\n10     print(\"The two numbers are the same.\")",
        "options": [
            "The print statement at line 04 will print only if the two numbers are equal in value.",
            "The print statement at line 06 will print only if num1 is less than num2.",
            "The print statement at line 08 will print only if num1 is greater than num2.",
            "The statement at line 09 is an invalid comparison."
        ],
        "a": [
            true,
            false,
            true,
            true
        ]
    },
    {
        "id": 13,
        "type": "DROPDOWN",
        "q": "A game development company needs a way to find the number of words in a list that contain a specific letter.<br><br>Complete the code by selecting the correct code segment from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "# Function accepts list of words and letter to search for.\n# Returns count of the number of words that contain that letter.\ndef count_letter(letter, word_list):\n    count = 0\n    \n    for [b1]\n        if [b2]\n            count += 1\n    return count\n\n# word_list is populated by the readWords() function. Code not shown.\nword_list = readWords()\n\nletter = input(\"Which letter would you like to count\")\nletter_count = count_letter(letter, word_list)\nprint(\"There are: \", letter_count, \" words that contain \", letter)",
        "options": [
            [
                "word_list in word:",
                "word in word_list:",
                "word == word_list:",
                "word is word_list:"
            ],
            [
                "word is letter:",
                "letter is word:",
                "word in letter:",
                "letter in word:"
            ]
        ],
        "a": [
            "word in word_list:",
            "letter in word:"
        ]
    },
    {
        "id": 14,
        "type": "DND",
        "q": "You are creating a guessing game. The program must:<br>• Generate a random number between 1 and 10.<br>• Allow the user up to three guesses.<br>• Stop immediately if the correct guess is entered.<br><br>Complete the code by moving the appropriate code segments into the correct locations.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct placement.</span>",
        "code": "from random import randint\ntarget = randint(1,10)\nchance = 1\nprint (\"Guess an integer from 1 to 10. You will have 3 chances.\")\n[target1]\n    guess = int(input(\"Guess an integer: \"))\n    if guess > target:\n        print (\"Guess is too high\")\n    elif guess < target:\n        print (\"Guess is too low\")\n    else:\n        print (\"Guess is just right!\")\n        [target2]\n    [target3]",
        "options": [
            "break",
            "chance += 1",
            "chance = 2",
            "pass",
            "while chance < 3",
            "while chance < 3:",
            "while chance <= 3:"
        ],
        "a": [
            "while chance <= 3:",
            "break",
            "chance += 1"
        ]
    },
    {
        "id": 15,
        "type": "DROPDOWN",
        "q": "You are creating a function to calculate admission fees (admission_fee) based on the following rules:<br><br>• Anyone under age 5 = free admission<br>• Anyone age 5 or older who is in school = $10<br>• Anyone age 5 to 17 who is not in school = $20<br>• Anyone older than age 17 who is not in school = $50<br><br>Complete the code by selecting the correct code segment from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "def admission_fee(age, school):\n    rate = 0\n    [b1]\n        rate = 10\n    [b2]\n        [b3]\n            rate = 20\n        else:\n            rate = 50\n    return rate",
        "options": [
            [
                "if age >= 5 and school == True:",
                "if age >= 5 and age <= 17:",
                "if age >= 5 and school == False:"
            ],
            [
                "elif age >= 5 and school == False:",
                "else age >= 5 and school == False:",
                "elif age >= 5 and school == True:"
            ],
            [
                "if age >= 5 and school == True:",
                "if age >= 5 and school == False:",
                "if age <= 17:"
            ]
        ],
        "a": [
            "if age >= 5 and school == True:",
            "elif age >= 5 and school == False:",
            "if age <= 17:"
        ]
    },
    {
        "id": 16,
        "type": "MCQ",
        "q": "The Script.py file contains the following code:<br><br><code>import sys\nprint(sys.argv[2])</code><br><br>You run the following command:<br><code>python Script.py Cheese Bacon Bread</code><br><br>What is the output of the command?",
        "options": [
            "Cheese",
            "Bacon",
            "Bread",
            "Script.py"
        ],
        "a": 1
    },
    {
        "id": 17,
        "type": "DROPDOWN",
        "q": "A coworker wrote a program that inputs names into a database. Unfortunately, the program reversed the letters in each name.<br><br>You need to write a Python function that outputs the characters in a name in the correct order.<br><br>Complete the code by selecting the code segment from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "#Function reverses characters in a string.\n#returns new string in reversed order.\n\ndef reverse_name(backward_name):\n    forward_name = \"\"\n    length = [b1]\n    while length >= 0:\n        forward_name += [b2]\n        length = length-1\n    return forward_name\n\nprint(reverse_name(\"nohtyp\"))",
        "options": [
            [
                "backward_name:",
                "len(backward_name)-1",
                "range(0,len(backward_name),-1)",
                "range(len(backward_name)-1,-1,-1)"
            ],
            [
                "backward_name[index]",
                "backward_name[length]",
                "backward_name[length+1]",
                "backward_name[len(backward_name)-len(forward_name)]"
            ]
        ],
        "a": [
            "len(backward_name)-1",
            "backward_name[length]"
        ]
    },
    {
        "id": 18,
        "type": "TF",
        "q": "You create the following Python function to calculate the power of a number. Line numbers are included for reference only.<br><br>For each statement, select True or False.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "01 # The calc_power function calculates exponents\n02 # x is the base\n03 # y is the exponent\n04 # The value of x raised to the y power is returned\n05 def calc_power(x, y):\n06     comment = \"# Return the value\"\n07     return x ** y # raise x to the y power",
        "options": [
            "Python will not check the syntax of lines 01 through 04.",
            "The pound sign (#) is optional for lines 02 and 03.",
            "The string in line 06 will be interpreted as a comment.",
            "Line 07 contains an inline comment."
        ],
        "a": [
            true,
            false,
            false,
            true
        ]
    },
    {
        "id": 19,
        "type": "MCQ",
        "q": "A friend asks you to refactor and document the following Python code:<br><br>What is the result?",
        "code": "value1 = 9\nvalue2 = 4\n\nanswer = (value1 % value2 * 10) // 2.0 ** 3.0 + value2",
        "options": [
            "The value 5.667 is displayed.",
            "The value 5.0 is displayed.",
            "A syntax error occurs.",
            "The value 129 is displayed."
        ],
        "a": 1
    },
    {
        "id": 20,
        "type": "MCQ",
        "q": "You write the following function to read a data file and print each line of the file. Line numbers are included for reference only.<br><br>When you run the program, you receive an error on line 03.<br><br>What is causing the error?",
        "code": "01 def read_file(file):\n02     line = None\n03     if os.path.isfile(file):\n04         data = open(file, 'r')\n05         for line in data:\n06             print(line)",
        "options": [
            "The isfile method does not accept one parameter.",
            "The isfile method does not exist in the path object.",
            "The path method does not exist in the os object.",
            "You need to import the os library."
        ],
        "a": 3
    },
    {
        "id": 21,
        "type": "MCQ2",
        "q": "You work on a team that is developing a lottery application.<br><br>You need to write code that generates a random number that meets the following requirements:<br>• The number is a multiple of 10.<br>• The lowest number is 10.<br>• The highest number is 200.<br><br>Which two code segments will meet the requirements? Each correct answer presents a complete solution. (Choose 2.)<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct answer.</span>",
        "options": [
            "from random import randint\nprint(randint(1, 20) * 10)",
            "from random import randint\nprint(randint(0, 20) * 10)",
            "from random import randrange\nprint(randrange(0, 200, 10))",
            "from random import randrange\nprint(randrange(10, 210, 10))"
        ],
        "a": [
            0,
            3
        ]
    },
    {
        "id": 22,
        "type": "DROPDOWN",
        "q": "You are writing a Python program for a weather app to determine if a temperature (temp) is Freezing, Cold, or Warm.<br><br>Complete the code by selecting the correct code segment from each drop-down list.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "temp = int(input(\"Enter the temperature: \"))\nstatus = \"Unknown\"\n[b1]\n    status = \"Freezing\"\n[b2]\n    status = \"Cold\"\n[b3]\n    status = \"Warm\"\nprint(\"It is \" + status + \".\")",
        "options": [
            [
                "if temp < 0:",
                "if temp > 0:"
            ],
            [
                "elif temp < 30:",
                "if temp < 30:",
                "elif temp > 30:",
                "if temp > 30:"
            ],
            [
                "else:",
                "elif:"
            ]
        ],
        "a": [
            "if temp < 0:",
            "elif temp < 30:",
            "else:"
        ]
    },
    {
        "id": 23,
        "type": "MCQ",
        "q": "You write the following code to determine an employee's salary bonus based on their base salary and years of experience:<br><br>What value will print?",
        "code": "salary = 4000\nexperience = 5\n\nif salary > 5000 and experience >= 5:\n    salary += 1000\nelif salary >= 3000 and experience > 3:\n    salary += 500\nelse:\n    salary -= 200\n\nprint(salary)",
        "options": [
            "4500",
            "5000",
            "3800",
            "4000"
        ],
        "a": 0
    },
    {
        "id": 24,
        "type": "MTF",
        "q": "You need to identify the data types of various operations.<br><br>Move the appropriate data types from the list on the left to the correct operations on the right. You may use each data type once, more than once, or not at all.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct match.</span>",
        "labels": [
            "int",
            "float",
            "str",
            "bool"
        ],
        "options": [
            "type(3.14)",
            "type(-42)",
            "type(\"false\")",
            "type(true)"
        ],
        "a": {
            "type(3.14)": "float",
            "type(-42)": "int",
            "type(\"false\")": "str",
            "type(true)": "bool"
        }
    },
    {
        "id": 25,
        "type": "MCQ2",
        "q": "A fitness company is creating a program that allows runners to log their steps. The program will calculate the distance run based on stride length.<br><br>You write the following Python code. Line numbers are included for reference only.<br><br>You need to define the two required functions.<br><br>Which two code segments should you use for line 01 and line 04? Each correct answer presents part of the solution. (Choose 2.)<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "01\n02     name = input(\"What is your name? \")\n03     return name\n04\n05     distance = steps * stride_length\n06     return distance\n07 step_count = int(input(\"How many steps did you run? \"))\n08 stride = 2.5\n09 runner = get_runner()\n10 total_distance = calc_distance(step_count, stride)\n11 print(runner, \", you ran \", total_distance, \" feet.\")",
        "options": [
            "01 def get_runner():",
            "01 def get_runner(runner):",
            "01 def get_runner(name):",
            "04 def calc_distance():",
            "04 def calc_distance(steps, stride):",
            "04 def calc_distance(steps, stride_length):"
        ],
        "a": [
            0,
            5
        ]
    },
    {
        "id": 26,
        "type": "MCQ",
        "q": "Review the following code:<br><br>What is the output of the print statement?",
        "code": "x = \"truck\"\ny = \"suv\"\nz = \"sedan\"\n\ndata = \"{1} and {0} and {2}\"\nprint(data.format(z, y, x))",
        "options": [
            "sedan and truck and suv",
            "truck and suv and sedan",
            "suv and sedan and truck",
            "suv and truck and sedan"
        ],
        "a": 2
    },
    {
        "id": 27,
        "type": "TF",
        "q": "For each statement about try statements, select true or false.",
        "options": [
            "An else clause in a try statement only executes if no exceptions were raised.",
            "A try statement can have a finally clause without an except clause.",
            "A try statement can have a finally clause and an except clause.",
            "The finally clause is skipped if an exception is caught."
        ],
        "a": [
            true,
            true,
            true,
            false
        ]
    },
    {
        "id": 28,
        "type": "TF",
        "q": "The following function calculates a discounted price. Line numbers are included for reference only.<br><br>For each statement, select true or false.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "code": "01 def calc_discount(price, pct):\n02     return price - (price * pct)\n03 retail = input(\"Enter the retail price: \")\n04 discount = input(\"Enter the discount decimal: \")\n05 result = calc_discount(retail, discount)\n06 print(\"The final price is \" + str(result))",
        "options": [
            "The code will generate a TypeError in line 03 and line 04.",
            "The code will generate an error in line 02 and line 05 because strings cannot be multiplied like floats.",
            "The code will correctly output data to the console."
        ],
        "a": [
            false,
            true,
            false
        ]
    },
    {
        "id": 29,
        "type": "TF",
        "q": "Review the following code segment:<br><br><code>f = open(\"data.csv\", \"w\")<br>f.write(\"ID,Name,Role\\n\")<br>f.close()</code>",
        "options": [
            "A file named data.csv is created if it does not exist.",
            "The data in the file will be appended to existing data.",
            "Other code can open the file after this code runs."
        ],
        "a": [
            true,
            false,
            true
        ]
    },
    {
        "id": 30,
        "type": "MCQ2",
        "q": "You are creating an HR script that accepts input from the user and outputs the data in a comma-delimited format.<br><br>You write the following code to accept input:<br><br><code>name = input(\"Enter employee name: \")<br>age = int(input(\"Enter age: \"))</code><br><br>The output must meet the following requirements:<br>• Enclose strings in double quotes.<br>• Do not enclose numbers in quotes or other characters.<br>• Separate items by commas.<br><br>You need to complete the code to meet the requirements.<br><br>Which two code segments could you use? Each correct answer presents a complete solution. (Choose 2.)<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct selection.</span>",
        "options": [
            "print('\"' + name + '\",' , age)",
            "print('\"{0}\",{1}'.format(name, age))",
            "print(name + ',' + age)",
            "print(f'\"{name}\", {age}')"
        ],
        "a": [
            1,
            3
        ]
    },
    {
        "id": 31,
        "type": "MTF",
        "q": "You are writing a Python application that includes multiple operations on the same line of code. You need to determine the correct order of precedence.<br><br>Move the operations from the list on the left to the correct locations on the right, with highest precedence at the top and lowest precedence at the bottom.<br><br><span style='font-size: 15px; font-style: italic;'>Note: You will receive partial credit for each correct response.</span>",
        "headers": [
            "Operations",
            "Operations in Order"
        ],
        "placeholder": "<span style='color: #64748b; font-size: 13px;'>Operation Type</span>",
        "labels": [
            "Addition and Subtraction",
            "Logical AND",
            "Exponents (**)",
            "Multiplication and Division",
            "Parentheses ()",
            "Unary positive, negative, bitwise NOT"
        ],
        "options": [
            "<span style='white-space:nowrap;'>Highest precedence</span>",
            "​",
            "​​",
            "​​​",
            "​​​​",
            "​​​​​"
        ],
        "a": {
            "<span style='white-space:nowrap;'>Highest precedence</span>": "Parentheses ()",
            "​": "Exponents (**)",
            "​​": "Unary positive, negative, bitwise NOT",
            "​​​": "Multiplication and Division",
            "​​​​": "Addition and Subtraction",
            "​​​​​": "Logical AND"
        }
    },
    {
        "id": 32,
        "type": "TF",
        "q": "You are writing a function that applies a discount to a retail price. The function has the following requirements:<br>• If no value is specified for the discount percentage, it starts at 10.<br>• If is_member is true, the discount percentage is doubled.<br><br>You write the following code. Line numbers are included for reference only.",
        "code": "01 def apply_discount(price, is_member, discount):\n02     if is_member == true:\n03         discount = discount * 2\n04     price = price - (price * discount / 100)\n05     return price\n06 discount = 5\n07 price = 100\n08 final_price = apply_discount(price, true, discount)",
        "options": [
            "To meet the requirements, you must change line 01 to: def apply_discount(price, is_member, discount = 10):",
            "If you do not change line 01 and the function is called with only two parameters, an error occurs.",
            "Line 03 will permanently modify the value of the variable discount declared at line 06."
        ],
        "a": [
            true,
            true,
            false
        ]
    },
    {
        "id": 33,
        "type": "MTF",
        "q": "You need to identify the results of performing various slicing operations on the following sequence structure:<br><br><code>digits = \"0123456789\"</code>",
        "options": [
            "digits[2:5]",
            "digits[:4]"
        ],
        "labels": [
            "345",
            "234",
            "1234",
            "0123",
            "2345",
            "01234"
        ],
        "a": {
            "digits[2:5]": "234",
            "digits[:4]": "0123"
        }
    },
    {
        "id": 34,
        "type": "SHORT",
        "q": "Review the following code segment:<br><br>How many lines of output does the code print?<br><span style='font-size: 12px; font-style: italic;'>Enter the number as an integer.</span>",
        "code": "total = 0\nn = 10\nwhile (n > 0):\n    total += n\n    print(total)\n    n -= 2\n    if n == 4:\n        break",
        "a": "3"
    },
    {
        "id": 35,
        "type": "DROPDOWN",
        "q": "You find errors while evaluating the following code. Line numbers are included for reference only. You need to correct the code at line 03 and line 06.",
        "code": "<div class='code-snippet'>01 chars = ['A', 'B', 'C', 'D', 'E']<br>02 index = 0<br>03 [b1]<br>04 &nbsp;&nbsp;&nbsp;&nbsp;print(chars[index])<br>05 <br>06 &nbsp;&nbsp;&nbsp;&nbsp;[b2]<br>07 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break<br>08 &nbsp;&nbsp;&nbsp;&nbsp;else :<br>09 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;index += 1</div>",
        "options": [
            [
                "while (index < 5) :",
                "while [index < 5]",
                "while (index < 6) :",
                "while [index < 6]"
            ],
            [
                "if chars[index] == 'D' :",
                "if chars[index] == 'D'",
                "if chars(index) = 'D' :",
                "if chars(index) != 'D'"
            ]
        ],
        "a": [
            "while (index < 5) :",
            "if chars[index] == 'D' :"
        ]
    },
    {
        "id": 36,
        "type": "MCQ",
        "q": "You are developing a script to calculate net profit. The formula utilizes exponents and floor division.<br><br>What is the final value of the <code>net_profit</code> variable?",
        "code": "revenue = 100\nexpenses = 4\n\nnet_profit = revenue - expenses * 2 ** 2 // 3 + (revenue % 9)",
        "options": [
            "96",
            "88",
            "110",
            "45"
        ],
        "a": 0
    },
    {
        "id": 37,
        "type": "MCQ",
        "q": "You are building a geometry application. You run the script and encounter a NameError on line 03.<br><br>What is causing the error?",
        "code": "01 \n02 def calculate_hypotenuse(a, b):\n03     c_squared = math.pow(a, 2) + math.pow(b, 2)\n04     return math.sqrt(c_squared)\n05 print(calculate_hypotenuse(3, 4))",
        "options": [
            "You need to import the math module.",
            "The math.pow function only accepts floating-point numbers.",
            "The c_squared variable must be globally declared.",
            "The calculate_hypotenuse function must return an integer."
        ],
        "a": 0
    },
    {
        "id": 38,
        "type": "MCQ",
        "q": "You are creating an automated email generation script for a real estate agency:<br><br>What is the output of the print statement?",
        "code": "city = \"Tokyo\"\nrooms = 2\nrent = 1200.50\n\nemail = \"The {1}-room apartment in {0} rents for ${2}.\"\nprint(email.format(city, rooms, rent))",
        "options": [
            "The 2-room apartment in Tokyo rents for $1200.50.",
            "The {rooms}-room apartment in {city} rents for ${rent}.",
            "A syntax error occurs because the variables are different data types.",
            "The Tokyo-room apartment in 2 rents for $1200.50."
        ],
        "a": 0
    },
    {
        "id": 39,
        "type": "TF",
        "q": "You are implementing a robust data pipeline that must handle errors properly. For each statement about exception handling, select true or false.",
        "options": [
            "You can use the 'raise' keyword to intentionally trigger an exception.",
            "A try block can be nested inside another try block or except block.",
            "Variables defined inside a try block are strictly local and cannot be accessed in the except block.",
            "If an exception is raised inside a try block, the program will always crash immediately."
        ],
        "a": [
            true,
            true,
            false,
            false
        ]
    },
    {
        "id": 40,
        "type": "TF",
        "q": "You are building an application that needs to securely log diagnostic data into a text file:<br><br><code>with open(\"server_logs.txt\", \"w\") as log_file:<br>&nbsp;&nbsp;&nbsp;&nbsp;log_file.write(\"System start\\n\")</code><br><br>For each statement, select true or false.",
        "options": [
            "Using the with statement ensures the file is automatically closed when the block ends.",
            "The mode \"w\" guarantees that existing data in the file will not be overwritten.",
            "If server_logs.txt does not exist, the code will throw a FileNotFoundError."
        ],
        "a": [
            true,
            false,
            false
        ]
    }
];