// ===== Word Room: 4-letter Wordle, 6 guesses =====

const WORD_LENGTH = 4;
const MAX_GUESSES = 6;
const MAP_PAGE = "level.html"; // where "Back to map" goes

// Possible answers (common, clean words)
const ANSWERS = [
    "able", "acid", "aged", "also", "area", "army", "away", "baby", "back", "bake", "ball", "band", "bank", "barn",
    "base", "bath", "bead", "beam", "bean", "bear", "beat", "bell", "belt", "bend", "best", "bike", "bird", "bite",
    "blue", "boat", "body", "bold", "bolt", "bone", "book", "boot", "bowl", "brag", "brew", "busy", "cage", "cake",
    "calm", "camp", "card", "care", "cart", "cash", "cave", "chef", "chip", "city", "clam", "clap", "claw", "clay",
    "clip", "club", "coal", "coat", "code", "coin", "cold", "comb", "cook", "cool", "cord", "corn", "cost", "crab",
    "crew", "crop", "crow", "cube", "cure", "dark", "dart", "dash", "data", "dawn", "deal", "deer", "desk", "dial",
    "dice", "diet", "dirt", "dish", "dive", "dock", "door", "dose", "dove", "down", "draw", "drip", "drop", "drum",
    "duck", "dune", "dust", "duty", "earn", "east", "easy", "echo", "edge", "epic", "exit", "face", "fact", "fair",
    "fall", "farm", "fast", "fern", "film", "fire", "firm", "fish", "fist", "flag", "flat", "flip", "foam", "fold",
    "folk", "food", "foot", "fork", "form", "fort", "four", "frog", "fuel", "full", "fund", "gate", "gear", "gift",
    "glow", "glue", "goal", "goat", "gold", "golf", "good", "gown", "grab", "grid", "grin", "grip", "gust", "hail",
    "half", "hall", "hand", "harp", "hawk", "heat", "herb", "hero", "hide", "hill", "hint", "hive", "hold", "hole",
    "home", "hook", "hope", "horn", "host", "huge", "hunt", "idea", "iron", "isle", "item", "jade", "jail", "jazz",
    "jump", "jury", "keen", "kelp", "kick", "kind", "king", "kite", "knee", "knot", "lake", "lamb", "lamp", "land",
    "lane", "lava", "lawn", "leaf", "lean", "lens", "life", "lift", "lime", "line", "link", "lion", "list", "load",
    "loaf", "lock", "loft", "lone", "loop", "lord", "lost", "loud", "luck", "lung", "maze", "meal", "melt", "mild",
    "milk", "mill", "mint", "mist", "mole", "moon", "moss", "moth", "move", "mule", "myth", "nail", "navy", "neck",
    "nest", "news", "nice", "node", "noon", "nose", "note", "oath", "open", "oven", "pace", "pack", "page", "pail",
    "pain", "palm", "park", "path", "peak", "pear", "pile", "pine", "pink", "pipe", "plan", "play", "plot", "plow",
    "plum", "poem", "pond", "pool", "port", "post", "pour", "pull", "pump", "race", "raft", "rain", "ramp", "rare",
    "reef", "rest", "rice", "ride", "ring", "road", "roam", "robe", "rock", "roof", "room", "root", "rope", "rose",
    "ruby", "rule", "rush", "rust", "safe", "sail", "salt", "sand", "sash", "seal", "seed", "ship", "shoe", "shop",
    "sign", "silk", "sing", "sink", "size", "skin", "slab", "sled", "slow", "snow", "soap", "sock", "soft", "soil",
    "song", "soup", "spin", "spot", "star", "stem", "step", "stew", "suit", "swan", "swim", "tail", "tale", "tank",
    "tape", "task", "team", "tent", "tide", "tile", "time", "tiny", "toad", "tomb", "tool", "tour", "town", "trap",
    "tree", "trip", "tube", "tuna", "turn", "twig", "vase", "vest", "view", "vine", "void", "vote", "wade", "wage",
    "wall", "wand", "warm", "wave", "weed", "well", "west", "whip", "wide", "wild", "wind", "wing", "wire", "wise",
    "wolf", "wood", "wool", "word", "work", "worm", "yard", "yarn", "year", "zero", "zone",
];

// Words accepted as guesses (bigger list, so real words aren't rejected)
const VALID_GUESSES = new Set(
    (
        "aaaa aaah aaas aang aapl aarp abba abbe abby abcd abcs abdi abed abel aber abet abhi abit able ably " +
        "abou abra abul abut acad acca acct aced aceh acer aces ache achy acid aclu acme acne acre acta acts " +
        "actu acyl adam addo adds addy adel aden adha adhd adil adsl aeon aero aest afar afro agar aged agee " +
        "agen ages agha agni agra agri agro agua ahab ahah ahem ahhh ahoy aida aide aids aiko ails aime aims " +
        "aint aire airs airy aish ajar ajax ajay ajit akan akin akon alam alan alas alba aldi aldo alec ales " +
        "alex alfa algo alia alix alka alla alle alli allo alls ally alma alms aloe alon alot alps also alta " +
        "alto alts alum alun alva amal aman amar amas amen amer ames amex amid amie amin amir amis amit amma " +
        "ammo amok amon amor amos amps amur anak anal anas anda andi ando andy anew ange anil anja anna anne " +
        "anni anno anon ansi ante anti ants anus anya aoki apac apec apes apex apis apos appa appl apps appt " +
        "apra aqsa aqua aqui arab aral aram aran arca arch arco arcs arcy arda ards area aren ares argh argo " +
        "aria arid arie arif aris ariz arlo arma arms army arne arno arnt aron arse arte arti arts arty arun " +
        "arvo arya asad asap asda asha ashe ashy asia asic asif asim asio asis asks asli asma asme asmr asos " +
        "assn asst asta astm asus atms atom atop atta attn atty atul auch audi auld aung aunt aura aust auth " +
        "auto avec avid avis aviv avon away awed awol awry awww axed axel axes axis axle axon ayer ayla azad " +
        "azam aziz azov azul azur baal baba babe babi babs babu baby baca bach back bada bade badr badu baek " +
        "baer baez bagh bags baha bahn bahr baht bail bain bair bait baja baka bake bakr baku bala bald bale " +
        "bali balk ball balm bama bana banc band bane bang bani bank bans bapu bara barb bard bare barf bari " +
        "bark barn barr bars bart baru base basf bash bask bass bast basu bata bate bath bats batt batu baum " +
        "bays bcci bday bdsm bead beak beal beam bean bear beat beau bebe beck bede beds beef beek been beep " +
        "beer bees beet begg begs bein beit bela bell belo belt bend bene beni benn bent benz berg berk berm " +
        "bern bert bess best beta beth beto bets bevy bffs bhai bias bibi bibs bide bids biel bien bier biff " +
        "bigg bigs bike bild bile bill bind bing binh bins bint biol bios bird bish bite bits blah blas blau " +
        "bldg bled bleh bleu blew blip blob bloc blog blot blow blue blum blur blvd bnsf boar boas boat boaz " +
        "boba bobo bobs boca bock bode body boer bogo bogs bohm bohn boho bohr boil bois boko boku bola bold " +
        "bole boll bolo bolt bomb bona bond bone bong bonk bonn bono bony boob boof book bool boom boon boop " +
        "boos boot bora bord bore borg bork born boro bose bosh boss both bots botw bout bowe bowl bows boxy " +
        "boyd boys boyz bozo brac brad brae brag brah bram bran bras brat bray brea bred bree bren bret brew " +
        "bric brie brig brim brin brio brit brno brom bron bros brow bruh brun brut bruv bryn bubs buch buck " +
        "bucs buda budd buds buff bugs bulb bulk bull bump bums bund bung bunk bunn buns bunt buoy bure burg " +
        "burj burl burn burp burr burt bury bush busi buss bust busy bute buti buts butt buys buzz byes byrd " +
        "byte cabo cabs cade cady caen cafe cage cagr cain cair cait cake cala calc cale calf cali call calm " +
        "cals came cami camo camp cams cana cane cann cano cans cant capa cape capo caps capt cara carb card " +
        "care carl caro carp carr cars cart cary casa case cash cask caso cass cast cate cath cato cats catt " +
        "cava cave cavs cbse cctv cdma cdna cebu cece cech ceci cede cell cena cent ceos cept cera cern cert " +
        "cesc cest cfpb cftc chad chae chai cham chan chao chap char chas chat chau chaz chee chef chem chen " +
        "cher chet chew chez chia chic chih chil chim chin chip chit chiu choc choe choi chon choo chop chou " +
        "chow choy chua chub chug chul chum chun ciao ciel cigs cima cine ciro cite citi city clad clam clan " +
        "clap claw clay clef clem cleo clin clio clip clit cllr clog clos clot club clue cmdr cmon cmos cnbc " +
        "cnet coal coat coax cobb coby coca cock coco coda code cody coed coen cogs cohn coil coin coke cola " +
        "cold cole coli coll colm colo colt coma comb come comm como comp coms cond cone conf cong conn cons " +
        "cont conv cook cool coon coop coos coot copa copd cope cops copy cora cord core cori cork corn corp " +
        "corr cort cory cosa cost cosy cota cote cots coun coup cour cove cowl cows cozy cpac cpap cpsu cpus " +
        "crab crag cram crap cray cred cree crew crib crim cris crit croc cron crop crow crtc crud crux cruz " +
        "cryo csgo csis cska ctrl cuba cube cubs cuck cuda cudi cues cuff cull cult cums cunt cuny cups curb " +
        "curd cure curl curt cuse cusp cuss cust cute cuts cyan cyst czar dabs daca dada dade dads daft dahl " +
        "dais dale dali dall daly dame damm damn damp dams dana dane dang dani dank dann dans dany dara dare " +
        "dari dark darn dart dash dass data date dato dave davy dawg dawn daya days dayz daze ddos dead deaf " +
        "deal dean dear debs debt deca deck deco dede deed deem deen deep deer dees deft defy deir deja deke " +
        "dela dele deli dell demi demo dems dena dene deng dens dent deny deon depo depp dept dera dere dern " +
        "derp desc desh desi desk deus deux deva devi devo devs dewy dhcp dial dian dias diaz dibs dice dick " +
        "didi didn dido died diem dier dies diet dieu diff digg digi digs dijk dike dili dill dima dime dina " +
        "dine ding dinh dink dino dint dion dior dios dips dire dirk dirt disc dish disk diss dist dita diva " +
        "dive divi diya dmca doan dock docs docu dodd dodo doer does doge dogg dogs doha doin dojo dole doll " +
        "doma dome domo doms dona done dong dono dons dont doom doon door dope dora dore dori dork dorm dorn " +
        "dory dose doss dost dota doth dots doug dour dove dowd down doze dprk drab drag dram draw drax dray " +
        "dred drew drip drop drug drum dslr dual dube dubs duce duck duct duda dude duds duel dues duet duff " +
        "duke dull duly duma dumb dump dune dung dunk dunn duos dupe dura dusk dust dutt duty dvds dwts dyck " +
        "dyed dyer dyes dyin dyke each eads earl earn earp ears ease east easy eats eazy ebay eben ecco echo " +
        "echr econ eddy eden eder edge edgy edie edin edit edna eels eeoc egan eggs egon egos ehhh ehud eine " +
        "elam elan elba elbe elec elia elie elin elio elks ella elle ello elly elmo elms elon elsa else emea " +
        "emil emin emir emit emma emmy emre emts enda endo ends engl enid enix enos ents envy enzo eoin eons " +
        "epic epps epub eras eren ergo eric erie erik erin eris eros esau esme espn essa esse esso esta este " +
        "etat etch etfs etna eton etsy etta eula euro eval evan even ever evie evil evra ewan ewen ewes exam " +
        "excl exec exes exit exon expo eyed eyes eyre ezra face fact fade fads fags fail fain fair fait fajr " +
        "fake falk fall fame fane fang fans faqs farc fare farm faro farr fars fart faso fast fata fate fats " +
        "faun faux fave favs fawn faye faze fdic fdny fear feat feds feed feel fees feet fein fela feld fell " +
        "felt fema fend feng fenn ferb ferg fern fess fest feta fete fett feud fiat fiba fico fics fide fido " +
        "fief fifa fife fifi fifo figs fiji fila file fill film filo fils fina find fine fink finn fins fios " +
        "fire firm firs fisa fish fisk fist fits fitz five fizz flac flag flak flan flap flat flaw flax flay " +
        "flea fled flee flew flex flip flit flog flop flor flow flue flux fmla fmri foal foam foci foes fogg " +
        "foia foie foil fold folk fomc fomo fond fong font food fook fool foot fora ford fore fork form fort " +
        "foss foto foul four fowl foxx foxy fpga frag fran frat frau fray fred free frei fren fret frey frog " +
        "from fron frum frye ftse fuck fuel fuji full fume fund fung funk furs fury fuse fuss futa fuze fuzz " +
        "fwiw fyfe gaal gaap gaba gabe gabi gaby gael gaff gaga gage gags gaia gail gain gait gala gale gall " +
        "gals galt gama game gang gant ganz gaol gaon gape gaps garb gard gare gary gash gasp gass gate gato " +
        "gaul gave gawd gawk gaya gaye gays gaza gaze gchq gcse gdpr gear geek gees geez gels gems gene geng " +
        "geno gens gent gerd gere geri germ gers gert gets getz geun ghar ghee gian gibb gifs gift giga gigi " +
        "gigs gila gild gill gilt gimp gina gini ginn gino gins girl giro gish gist gita give giza glad glam " +
        "glas glee glen glib glob glow glue glum glut glyn gmbh gmos gnat gnaw goad goal goat gobi gods goer " +
        "goes goff gogh gogo goin goku gold golf gona gone gong good goof goon goop gord gore goro gory gosh " +
        "goss goth goto gots gott gout gove govt gown goya gpus grab grad graf gram gran gras gray graz greg " +
        "grew grey grid grim grin grip gris grit grog gros grow grrr grub gtav gtfo guam guan gulf gull gulp " +
        "gump gums gung gunk gunn guns gurl guru gush gust guts guys gwen gwyn gyan gyms gyro haag haan haar " +
        "haas habs hack hadi haha hahn haig hail haim hain hair haji hajj haka hake hala hale half hall halo " +
        "halt hama hamm hams hana hand hang hani hank hans happ hara hard hare hari hark harm harp hart haru " +
        "harv hash hass hast hate hath hats haul haus haut have hawk haya haye hays haze hazy hdmi hdtv head " +
        "heal heap hear heat heck heed heel heer heft hehe heil hein heir hela held heli hell helm helo help " +
        "hema heme hemi hemp heng hens hera herb herc herd here hero herr hers herz hess hewn heya hgtv hibs " +
        "hick hide hier high hiit hike hill hilo hilt hime hina hind hine hing hint hips hire hiro hiss hist " +
        "hite hits hive hiya hmas hmmm hmph hmrc hoax hobo hock hoes hoff hogg hogs hoke hola hold hole holi " +
        "holm holo holt holy home homo homs hone hong honk hons hood hoof hook hoon hoop hoot hope hopi hops " +
        "hora hori horn hors hose hosp hoss host hots hour hove howe howl hows hoya hoyt hplc href hsbc html " +
        "http hubs huck huda hued hues huey huff huge hugh hugo hugs hula hulk hull hulu huma hume hump hums " +
        "hung hunk huns hunt hurd hurl hurt hush husk huts hutt hutu hvac hwan hyde hymn hype hypo hyuk hyun " +
        "iaaf iaea iago iain iata ibex ibid ibis ibra icao icbm iced ices ichi icky icon icrc idea ides idle " +
        "idly idol idps ieds ieee iffy ifrs igbo iggy ight igor ihop iirc ikea ikon ilan ilia ills ilya imac " +
        "imam iman imax imdb imho imma imps inca ince inch incl indi indo indy ines inez info inga inge ings " +
        "init inks inky inna inns insp inst inte intl into ints inxs iona ions iota iowa ipad ipcc ipod ipos " +
        "ipsa ipso iptv iran iraq iras iris irks irma iron isaf isbn isco isha isil isis isla isle isms isnt " +
        "isps isro issa issn itch item iter itis itll itty iucn ivan ivar iver ives ivey ivor iyer izzo izzy " +
        "jaan jabs jace jack jaco jada jade jago jagr jags jail jain jake jama jamb jams jana jane jang jani " +
        "japs jarl jars java javi jaws jaya jaye jays jazz jean jedi jeep jeet jeez jeff jeju jell jena jenn " +
        "jens jeon jerk jess jest jesu jets jett jews jian jibe jigs jill jima jimi jing jinn jinx jiro jive " +
        "jizz joan joao jobe jobs jock jodi jody joel joes joey john joie join jojo joke jolt jong joni joon " +
        "jose josh joss jost jour jove jovi joys jpeg json juan juba judd jude judi judo judy jugs juju juke " +
        "juli july juma jump june jung juni junk juno jura jure juri jury just jute juve kahn kain kaka kala " +
        "kale kali kama kami kamp kana kane kang kann kano kant kanu kaos kara kari karl karo karp karr kart " +
        "kash kasi kass kata kate kath kato katy katz kaur kava kaya kaye kayo kcal kean keck keef keel keen " +
        "keep kegs keir keke kell kelp kemp keno kent kept kerb keri kern kerr keto keys khan khun kick kidd " +
        "kids kidz kiel kiev kiir kike kiki kiko kill kiln kilo kilt kimi kind king kink kino kira kiri kirk " +
        "kiss kita kite kits kitt kiva kiwi klan klay klee klux knee knew knit knob knot know knox knut kobe " +
        "kobo koch kock koda kodi kofi kohl kohn koji koko kola kolb kolo kona kong kono kony kook kool korg " +
        "korn kors kota koto kpmg kpop kray kree kris krug kuan kubo kuch kudo kuhn kuma kung kurd kuro kurt " +
        "kush kuta kwai kwan kwok kwon kyiv kyle kylo kyra labs lace lack lacs lacy ladd lads lady lagi lago " +
        "lags laid lain lair lake lakh lala lalo lama lamb lame lamp lamy lana land lane lang lani lans laos " +
        "lapd laps lara lard lark lars lash lass last lata late laud lava lawn laws lays lazy lead leaf leah " +
        "leak lean leap lear lech leda leds leed leek leer lees left legg lego legs leia leif lela lena lend " +
        "leng leni leno lens lent lenz leon leos less lest leto lets lett levi levy lewd lewy lexa lexi lgbt " +
        "liam lian liao liar libs lice lich lick lidl lido lids lied lien lier lies lieu life lift liga like " +
        "lila lili lilo lily lima limb lime limo limp lina linc lind line ling link linn lino lint linz lion " +
        "lipa lipo lips lira lire lisa lise lisp list lita lite litt live livy liza lmao load loaf loam loan " +
        "lobe lobo loca loch loci lock loco lode lodi lodz loeb loew loft logo logs loin lois loki lola loli " +
        "lolo lols lolz loma lone long look loom loon loop loos loot lope lora lord lore lori lose loss lost " +
        "lotr lots lott loud loup love lowe lows lpga lsat ltte lube luca luce luci luck lucy ludo luge lugo " +
        "lugs luis luiz luka luke lula lull lulu lulz lump luna lund lune lung lupe lupo lure lurk lush lust " +
        "lute lutz luxe lviv lyft lyin lyle lyme lyne lynn lynx lyon lyra lyre maan maar maas mace mach mack " +
        "macs macy made madi mads maga mage magi mags maha mahi maia maid mail maim main mair mais maja make " +
        "maki mako mala male mali mall malo malt mama mame mami mana mane mang mani mann mano mans manu manx " +
        "many maps mara marc mare marg mari mark marl maro marr mars mart maru marv marx mary masa mash mask " +
        "mass mast mata mate math mato mats matt maud maui maul maus mavs mawr maxi maxx maya mayo mays maze " +
        "mbbs mbps mbta mcat mdma mead meal mean meat mech medi meds meek meer meet mega mehr mein meir mela " +
        "meld melo melt meme memo mems mena mend meng mens ment menu meow meps mera merc mere meri mers merv " +
        "mesa mesh meso mess meta mete meth mets metz mews mgmt mian miao mica mice mich mick mics midi mids " +
        "migs miho mika mike miki miko miku mila mild mile milf mili milk mill milo mils milt mime mimi mimo " +
        "mina mind mine ming minh mini mink minn mino mins mint minx mips mira mire miri miro misa misc mise " +
        "mish miso miss mist mita mite mitt mlas mlle mmhg mmmm mmol mnet moab moan moat mobo mobs moby moca " +
        "mock moda mode modi modo mods moen mofo mogg mohd mohr moir mojo mola mold mole moll moly moma momo " +
        "moms mona mond mone mong moni monk mono mons mont mooc mood moog mook moon moor moos moot mops mora " +
        "more mori morn moro mort mose mosh moss most mota mote moth moti moto mott move moya mpaa mpeg mpls " +
        "mrna mrsa msps msrp muay much muck muda mudd muff mugs muir mule mull mums muni munk munn murs musa " +
        "muse mush musk muss must mute mutt mvps mwah myer myra myth naan nabi nach nacl nada nadu naga nags " +
        "nagy naia naik nail nair naka nala nama name nami nana nand nang nani nano napa nape naps nara narc " +
        "nars nary nasa nash nasi nasl nasr nass nast nata nate nath natl nato nats nava nave navi navy naya " +
        "nazi nbsp ncaa ncis ndtv neal near neat neck need neel neem neet neff neha neil nein neko nell nema " +
        "nemo nene neon nepa nerd nerf neri nero ness nest neto nets nett neue neva neve news newt next nfpa " +
        "ngos nibs nice nick nico nics nicu nida niel nier nigh nike niki niko nile nils nimh nina nine ning " +
        "nino nips niro nisa nisi nist nita nite njpw nlrb nmda noaa noah noam nobu node nods noel noes noir " +
        "nola noll noma nome noms nona none nong noni nono noob nook noon nooo noor nope nora nord nori norm " +
        "nose nosy nota note noth nots nott noun nour nous nova novi novo nowt npcs nsfw ntsb ntsc nude nuer " +
        "nuff nuit nuke null numb nunn nuns nuri nusa nuts nutt nuys nypd nyse oahu oaks oars oath oats oban " +
        "obey obit oboe ocho oclc odds oden oder odes odin odis odom odor oecd oems offs ogle ogre ogun ohhh " +
        "ohio ohms ohno oils oily ojai okay okey okie okla okra olaf olde olds oled oleg olga olin olli olly " +
        "oman omar omen omer omfg omit omni once ondo ones only onna onto onus onyx oooh oooo oops ooze opal " +
        "opec opel open oper opie oppa oppo opry opts opus oral oran orbs orca orcs oren oreo ores orgs orgy " +
        "orig orin orla orly orme oryx osce osha oslo otis otto ouch ould ours ouse oust outa outs oval oven " +
        "over ovid owed owen owes owls owns oxen oxon ozil ozzy pace pack paco pacs pact padi pads page paid " +
        "pail pain pair pais paki pala pale pali pall palm palo pals pana pane pang pani pans pant papa pape " +
        "papi para parc pare pari park parr pars part paso pass past pata pate path pats paul pave pawn paws " +
        "pays pbuh pcbs pcie pcos pdfs peak peal pear peas peat peck pecs pedo peds peed peek peel peep peer " +
        "pees peet pegg pegs pele pell pelt pena peng penh penn pens pent pepe pera perc pere perf peri perk " +
        "perl perm pero perp pers pert peru perv peso pest peta pete petr pets pews pfft pham phan phat phds " +
        "phew phil phys pica pick pico pics pied pier pies piet pigs pika pike pile pill pima pimp pina pine " +
        "ping pink pino pins pint pipe pips pisa piss pita pith pits pitt pity pius plan plat play plea pled " +
        "plex plop plos plot plow ploy plug plum plus pmqs poco pods poem poet pogo pohl poke pole poli polk " +
        "poll polo poly pomp poms pond pong pons pont pony poof pooh pool poon poop poor pope popo pops pore " +
        "pork porn port pose posh posi poss post pots pour pout pows pram prat pray prem prep pres pret prev " +
        "prey prez prim prix prob proc prod prof prog prom prop pros prot prov prue psst ptsd pubg publ pubs " +
        "puck puff pugh pugs puig puja puke pull pulp puma pump pune punk puns punt puny pupa pups pura pure " +
        "puri purr push puss puta puts putt pyke pyle pyne pyre pyro qian qing quad quai qual quan quay quds " +
        "ques quid quin quip quit quiz quot raab raaf rabi race rach rack racy rada rafa rafe raff rafi raft " +
        "raga rage rags rahm raid rail rain raja raju rake ralf rama rami ramp rams rana rand rang rani rank " +
        "rant rape rapp raps rapt rare rasa rash rask rasp rata rate rath rats raul rave ravi raya rayo rays " +
        "raza raze rbis rcmp read real ream reap rear reba recs redd redo reds reed reef reek reel rees refs " +
        "regi regs reid rein reis reit rely remi remo remy rena rend rene reno rent repo reps resp rest reus " +
        "revd reve revs reza rfid rhea rhee rhys riaa rian riba ribs rica rice rich rick rico rida ride rien " +
        "ries rife riff rift riga rigg rigs rika riki rile rime rims rina rind ring rink rino rios riot ripe " +
        "rips risa rise risk rita rite ritz riva rive rnas rnli road roam roan roar robb robe robo robs roby " +
        "roca rock rode rods rofl rohr rojo roku role rolf roll roma rome romo romp roms romy rona rong roni " +
        "rood roof rook room roos root rope rory rosa rose rosh ross rosy rota rotc rote roth roti rots rout " +
        "roux rove rowe rows roxy rpgs rrna rrsp rspb rsvp ruan rube rubs ruby ruck rudd rude rudi rudy ruff " +
        "rugs ruhr ruin ruiz rukh rule rumi rump rune rung runs runt rupa rupp ruse rush rusk russ rust ruth " +
        "ryan ryde saab saad saar saas saba sabo sack sacs sade sadr safe saga sage saha said saif sail sais " +
        "saka sake saki saks sala sale salk salt sama same sami sams sana sand sane sang sani sank sano sans " +
        "sant sapp saps sara sari sark sars sasa sash sask sass sata sate sati sato sats saud saul save sawn " +
        "saws saxe saya says scab scam scan scar scat scot scsi scud scum sdgs sdlp sdsu seal seam sean sear " +
        "seas seat sebi seco secs sect seed seek seem seen seep seer sees sega sein self sell sema semi sena " +
        "send seng sens sent seok seon sepp sept sera serb serf seri serv sesh seth seti sets sewn sexy shad " +
        "shae shag shah shai sham shan shao shaq shar shat shaw shay shea shed shek shel shem shen shep sher " +
        "shes shew shhh shia shih shim shin ship shit shiv shoe shoo shop shot shou show shri shui shun shut " +
        "siam sian sich sick side sidi sids sieg siem sift sigh sign sikh sila silk sill silo silt sima simi " +
        "sims sina sind sine sing sink sinn sino sins sion sips sire siri siro sirs sisi sita site sith sits " +
        "situ siva size sjws skew skid skim skin skip skis skit skye slab slag slam slap slav slaw slay sled " +
        "slew slid slim slip slit slob slog slop slot slow slug slum slur slut smes smit smog smol smth smug " +
        "smut snag snap sncf snes snip snob snot snow snub snug soak soap soar soba sobs soca sock soda sofa " +
        "sofi soft sohn soho soil soir sola sold sole soli solo soma some sona sone song sono sons sont sony " +
        "sook soon sooo soot sopa soph sora sore sort sosa soto soul soup sour sous sown sows soya spam span " +
        "spar spas spat spay spaz spca spec sped spew spin spit spot spry spud spun spur sqft sram ssds stab " +
        "stag stan star stat stax stay stds stef stem sten step stew stfu stig stil stir stis stop stow stub " +
        "stud stun styx subs such suck sudo suds sued sues suet suez sufi suga suge suis suit suki sulk sulu " +
        "sumo sump sums sung sunk suns suny supp supt sura sure surf surg suri suss suva suvs suzi suzy sven " +
        "swab swag swam swan swap swat sway swig swim swot swum sxsw syed syfy sync tabs tack taco tact tada " +
        "tafe taft tags taha tail tait taka take taki talc tale tali talk tall tama tame tami tana tang tank " +
        "tans taos tape taps tara tard tarn taro tarp tarr tars tart tash task tass tata tate tati tats taub " +
        "taut taxa taxi tbsp teak teal team tear teas teat tech tedx teed teen tees tele tell temp tend teng " +
        "tenn tens tent tera tere teri term tern terr tess test tete teva text thad thai than thar that thaw " +
        "thay thea thee thei them then theo ther thes thet they thin this thom thon thor thos thot thou thro " +
        "thru thud thug thun thus tian tick tics tide tidy tied tien tier ties tiff tiki tile till tilt time " +
        "timo tims tina tine ting tink tino tins tint tiny tion tips tire tish tite tito tits tivo tmnt toad " +
        "tobe tobi toby tock toda todd todo toed toes tofu toga togo toil toke toki told toll toma tomb tome " +
        "tomi tomo toms tone tong toni tonk tons tony took tool toon toot topo tops tora tore tori torn toro " +
        "torr tort tory tosh toss tote toth toto tots tour tous tout tove town toyo toys trac trad trae tram " +
        "tran trap trav trax tray tree trek tren tres trev trey trig trim trio trip tris trix trna trod tron " +
        "trop trot troy true tsai tsar tsui ttip tuam tuan tuba tube tubs tuck tues tuff tuft tugs tula tull " +
        "tuna tune tung turd turf turk turn tusk tutu twas twat twee twig twin twit twos tyne type typo tyra " +
        "tyre uavs uber ucas ucla ucsb ucsd ucsf uday udon uefa ufos uggs ugly uhhh ukip ulta umar ummm umno " +
        "undo undp unep unis unit univ unix unlv unni unsc unto upon upto ural urdu urea urge urgh uric urls " +
        "urns ursa usaf uscg usda used user uses usgs usmc usps ussr utah utes vaal vaca vail vain vale vamp " +
        "vane vann vans vape vary vase vast vats veal veda veep veer vega veil vein vela vena venn vent vera " +
        "verb vere vern vero vers vert very vest veto vets vevo vial vibe vice vick vict vida vide vids vied " +
        "viet view vigo viii vila vile vine vino vips visa vise vita vite vito viva vive vivi vivo vlad vlan " +
        "vlog vmas voce vogt void voip voir vole volk vols volt voor voss vote vous vows vpns wack waco wada " +
        "wade wadi wads wage wags wahl wail wain wait waka wake wala wald wale wali walk wall walt wand wane " +
        "wang wani wank want wapo ward ware warm warn warp wars wart wary wash wasn wasp wass wast watt wave " +
        "wavy wawa waxy ways waze weak wean wear webb webs weds weed week ween weep weft weil weir weis weld " +
        "well welp welt wenn went wept were werk west weve wham what when whet whew whey whig whim whip whit " +
        "whiz whoa whom whoo whos whys wich wick wide wien wife wifi wigs wiiu wiki wild wile wilf will wilt " +
        "wily wimp wind wine wing wink winn wins wipe wire wiry wise wish wisp with wits witt wnba woah woes " +
        "woke wold wolf womb wong wont wood woof wook wool wooo woop woot word wore worf work worm worn wort " +
        "wove wows wrap wray wren writ wulf wuss wwdc wwii wynn xavi xbox xena xeon xian xiao xiii xing xmas " +
        "xoxo xray xtra xuan xvii xxii xxiv xxxx yada yale yall yama yams yana yang yank yann yano yaoi yara " +
        "yard yarn yash yawn yaya yeah year yeet yell yelp yeon yeti yhwh ying ymca yoda yoga yogi yoke yoko " +
        "yolk yolo yong yoon yore york yost youd your yous yoyo yuan yuba yuck yuen yuki yuko yule yuma yume " +
        "yumi yuna yung yuri yurt yves zach zack zaha zain zane zanu zany zara zayn zaza zeal zedd zeit zeke " +
        "zell zeng zeno zero zest zeta zeus zhao zhen zhou zika zinc zine zing zinn zion zips zoey zola zona " +
        "zone zoom zoos zoot zora zorn zoro zoya zuko zulu zuma zuni zwei"
    ).split(" ").concat(ANSWERS)
);

// ----- State -----
let answer = "";
let guesses = [];      // submitted guesses
let current = "";      // what's being typed
let gameOver = false;
let revealing = false; // block input during the flip animation

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const playAgainBtn = document.getElementById("play-again");
document.getElementById("back-to-map").href = MAP_PAGE;

const KEY_ROWS = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    ["enter", ..."zxcvbnm".split(""), "back"],
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ----- Setup -----
function buildBoard() {
    boardEl.innerHTML = "";
    for (let r = 0; r < MAX_GUESSES; r++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            row.appendChild(tile);
        }
        boardEl.appendChild(row);
    }
}

function buildKeyboard() {
    keyboardEl.innerHTML = "";
    for (const keys of KEY_ROWS) {
        const row = document.createElement("div");
        row.className = "key-row";
        for (const k of keys) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "key";
            btn.dataset.key = k;
            if (k === "enter") { btn.textContent = "Enter"; btn.classList.add("wide"); }
            else if (k === "back") { btn.textContent = "Del"; btn.classList.add("wide"); btn.setAttribute("aria-label", "Delete"); }
            else btn.textContent = k;
            btn.addEventListener("click", () => {
                handleKey(k);
                btn.blur(); // so pressing Enter on a physical keyboard doesn't re-click this button
            });
            row.appendChild(btn);
        }
        keyboardEl.appendChild(row);
    }
}

function newGame() {
    answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    guesses = [];
    current = "";
    gameOver = false;
    revealing = false;
    playAgainBtn.hidden = true;
    showMessage("");
    buildBoard();
    buildKeyboard();
}

// ----- Input -----
function handleKey(key) {
    if (gameOver || revealing) return;

    if (key === "enter") submitGuess();
    else if (key === "back") {
        current = current.slice(0, -1);
        updateCurrentRow();
    } else if (/^[a-z]$/.test(key) && current.length < WORD_LENGTH) {
        current += key;
        updateCurrentRow();
    }
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "enter") { e.preventDefault(); handleKey("enter"); }
    else if (k === "backspace") handleKey("back");
    else if (/^[a-z]$/.test(k)) handleKey(k);
});

playAgainBtn.addEventListener("click", newGame);

// ----- Board updates -----
function updateCurrentRow() {
    const row = boardEl.children[guesses.length];
    [...row.children].forEach((tile, i) => {
        const letter = current[i] || "";
        tile.textContent = letter;
        tile.classList.toggle("filled", letter !== "");
    });
}

function submitGuess() {
    if (current.length < WORD_LENGTH) return rejectRow("Not enough letters");
    if (!VALID_GUESSES.has(current)) return rejectRow("Not in word list");

    const guess = current;
    const result = scoreGuess(guess, answer);
    const rowIndex = guesses.length;
    guesses.push(guess);
    current = "";

    revealRow(rowIndex, guess, result).then(() => {
        updateKeyboard(guess, result);
        if (guess === answer) {
            endGame(true, rowIndex);
        } else if (guesses.length === MAX_GUESSES) {
            endGame(false);
        }
    });
}

function rejectRow(text) {
    showMessage(text, true);
    const row = boardEl.children[guesses.length];
    row.classList.remove("shake");
    void row.offsetWidth; // restart animation
    row.classList.add("shake");
}

// Scores a guess, handling repeated letters correctly.
// Returns an array like ["correct", "absent", "present", "absent"].
function scoreGuess(guess, target) {
    const result = Array(WORD_LENGTH).fill("absent");
    const remaining = {};

    // First pass: exact matches
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === target[i]) result[i] = "correct";
        else remaining[target[i]] = (remaining[target[i]] || 0) + 1;
    }
    // Second pass: right letter, wrong spot
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === "correct") continue;
        if (remaining[guess[i]] > 0) {
            result[i] = "present";
            remaining[guess[i]]--;
        }
    }
    return result;
}

function revealRow(rowIndex, guess, result) {
    revealing = true;
    const tiles = [...boardEl.children[rowIndex].children];
    const step = reducedMotion ? 0 : 300;

    tiles.forEach((tile, i) => {
        setTimeout(() => {
            tile.classList.add("flip");
            // swap color at the midpoint of the flip
            setTimeout(() => {
                tile.classList.remove("filled");
                tile.classList.add(result[i]);
            }, reducedMotion ? 0 : 225);
        }, i * step);
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            revealing = false;
            resolve();
        }, (WORD_LENGTH - 1) * step + (reducedMotion ? 0 : 450));
    });
}

function updateKeyboard(guess, result) {
    const rank = { absent: 1, present: 2, correct: 3 };
    for (let i = 0; i < WORD_LENGTH; i++) {
        const keyEl = keyboardEl.querySelector(`[data-key="${guess[i]}"]`);
        if (!keyEl) continue;
        const old = ["correct", "present", "absent"].find((c) => keyEl.classList.contains(c));
        if (!old || rank[result[i]] > rank[old]) {
            keyEl.classList.remove("correct", "present", "absent");
            keyEl.classList.add(result[i]);
        }
    }
}

function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.classList.toggle("error", isError);
}

// ----- End of game -----
function endGame(won, rowIndex) {
    gameOver = true;
    if (won) {
        const praise = ["Genius!", "Brilliant!", "Great job!", "Nice!", "Close one!", "Phew!"];
        showMessage(`${praise[rowIndex]} Solved in ${rowIndex + 1}/${MAX_GUESSES}. Next challenge coming up…`);
        boardEl.children[rowIndex].classList.add("bounce");
    } else {
        showMessage(`Out of guesses. The word was ${answer.toUpperCase()}. Next challenge coming up…`);
    }
    playAgainBtn.hidden = true;

    // Hook for the rest of the game (e.g. save to Firebase). Remove if not needed.
    sessionStorage.setItem("wordleResult", JSON.stringify({ won, guesses: guesses.length, word: answer }));

    // Move on to Memory Match after a few seconds
    setTimeout(() => {
        window.location.href = "memory.html";
    }, 3000);
}

newGame();